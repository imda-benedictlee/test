import { test, expect } from '@playwright/test'
import { ObjectId } from 'mongodb'
import { projects } from './queries.spec.js';

import axios from 'axios';

const ENDPOINT = "http://localhost:4000/graphql"

const CREATE_PROJECT = `mutation CreateProject($project: ProjectInput!) {
    createProject(project: $project) {
      projectInfo {
        name,
        company,
        description,
        reportTitle
      },
      id
    }
  }`

const UPDATE_PROJECT = `mutation Mutation($updateProjectId: ObjectID!, $project: ProjectInput!) {
    updateProject(id: $updateProjectId, project: $project) {
      projectInfo {
        name
        description
        company
        reportTitle
      }
    }
  }`

const DELETE_PROJECT = `mutation DeleteProject($deleteProjectId: ObjectID!) {
    deleteProject(id: $deleteProjectId)
  }`

const CLONE_PROJECT = `mutation Mutation($cloneProjectId: ObjectID!) {
    cloneProject(id: $cloneProjectId) {
      projectInfo {
        name
        description
        reportTitle
        company
      }
    }
  }`

const GENERATE_REPORT = `mutation Mutation($projectId: ObjectID!, $algorithms: [String]!) {
    generateReport(projectID: $projectId, algorithms: $algorithms) {
      projectSnapshot {
        report {
          projectID
          status
          timeStart
          timeTaken
          totalTestTimeTaken
          inputBlockData
        }
      }
    }
  }`

const GENERATE_REPORT_TO_GENERATE_REPORT_STATUS = `mutation GenerateReport($projectId: ObjectID!, $algorithms: [String]!) {
    generateReport(projectID: $projectId, algorithms: $algorithms) {
      projectID
      status
    }
  }`

const CANCEL_TEST_RUNS = `mutation Mutation($projectId: ObjectID!, $algorithms: [String]!) {
    cancelTestRuns(projectID: $projectId, algorithms: $algorithms) {
      projectID
      status
      timeStart
      timeTaken
      totalTestTimeTaken
      inputBlockData
    }
  }`

const PROJECT_VARIABLES = {
    "project": {
        "projectInfo": {
            "name": "test7",
            "company": "Testing Company 7",
            "description": "We do testing",
            "reportTitle": "Testing"
        },
        "globalVars": null,
        "pages": null,
        "inputBlockData": null,
        "testInformationData": null
    }
}

test.describe('Create Project', () => {

    test('Project Created', async () => {

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: CREATE_PROJECT,
            variables: PROJECT_VARIABLES
        })

        const projectInfo = response.data.data.createProject.projectInfo

        // Assert Response
        expect(projectInfo).toEqual(PROJECT_VARIABLES.project.projectInfo)
    })

    test('Project Creation Failed', async () => {

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: CREATE_PROJECT,
            variables: PROJECT_VARIABLES
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].extensions.code).toBe('INTERNAL_SERVER_ERROR')
    })

})

test.describe('Update Project', () => {

    test('Project Updated', async () => {

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT,
            variables: {
                "updateProjectId": "63be7fc7d43d9b23db71ff30",
                "project": {
                    "projectInfo": {
                        "name": "Test 11",
                        "company": "Testing Company 10"
                    }
                }
            }
        })

        const projectInfo = response.data.data.updateProject.projectInfo

        // Get Project Info directly from MongoDB
        const query = { _id: ObjectId("63be7fc7d43d9b23db71ff30") }
        const projectInfoObj = await projects.findOne(query)

        // Assert Response
        expect(projectInfo.name).toBe(projectInfoObj.projectInfo.name)
        expect(projectInfo.company).toBe(projectInfoObj.projectInfo.company)

    })

    test('Invalid ID', async () => {

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT,
            variables: {
                "updateProjectId": "123",
                "project": {
                    "projectInfo": {
                        "name": "Test 3",
                        "company": "Testing Company 3"
                    }
                }
            }
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].extensions.code).toBe('BAD_USER_INPUT')
    })

})

test.describe('Delete Project', () => {

    test('Project Deleted', async () => {

        // Send Request
        await axios.post(ENDPOINT, {
            query: DELETE_PROJECT,
            variables: {
                "deleteProjectId": "63b5496ac05b0b2df748f46b"
            }
        })

        const response = await axios.post(ENDPOINT, {
            query: GET_PROJECT_BY_ID,
            variables: {
                "projectId": "63b5496ac05b0b2df748f46b"
            }
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].extensions.code).toBe('INTERNAL_SERVER_ERROR')
    })

    test('Invalid ID', async () => {

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: DELETE_PROJECT,
            variables: {
                "deleteProjectId": "63b5496ac05b0b2df748f46b"
            }
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].extensions.code).toBe('INTERNAL_SERVER_ERROR')
    })

})

test.describe('Clone Project', () => {

    test('Project Cloned', async () => {

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: CLONE_PROJECT,
            variables: {
                "cloneProjectId": "63be7f0cd43d9b23db71ff27"
            }
        })

        const projectInfo = response.data.data.cloneProject.projectInfo

        // Get Project Info directly from MongoDB
        const query = { _id: ObjectId("63be7f0cd43d9b23db71ff27") };
        const projectInfoObj = await projects.findOne(query)

        // Assert Response
        expect(projectInfo.name).toBe("Copy of " + projectInfoObj.projectInfo.name)
        expect(projectInfo.company).toBe(projectInfoObj.projectInfo.company)
    })

    test('Invalid ID', async () => {

    })
})

test.describe('Generate Report', () => {

    test('Report Generated', async () => {

        // Create a Project
        const createProject = await axios.post(ENDPOINT, {
            query: CREATE_PROJECT,
            variables: PROJECT_VARIABLES
        })

        const projectId = createProject.data.data.createProject.id

        // Generate Report into Generating Report State
        const generateReport = await axios.post(ENDPOINT, {
            query: GENERATE_REPORT_TO_GENERATE_REPORT_STATUS,
            variables: {
                "projectId": projectId,
                "algorithms": "aiverify.algorithms.partial_dependence_plot:partial_dependence_plot"
            }
        })

        expect(generateReport.data.data.generateReport.status).toBe("ReportGenerated")

    })

    test('Report Generation In Progress', async () => {

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: GENERATE_REPORT,
            variables: {
                "projectId": "63b518f4c05b0b2df748f418",
                "algorithms": "aiverify.algorithms.partial_dependence_plot:partial_dependence_plot"
            }
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Unexpected error value: \"Previous report generation still running\"")

    })

})

test.describe('Cancel Test Run', () => {

    test('Cancel Test Run with Valid Project ID & With Report', async () => {

        //Create a Project
        const createProject = await axios.post(ENDPOINT, {
            query: CREATE_PROJECT,
            variables: PROJECT_VARIABLES
        })

        const projectId = createProject.data.data.createProject.id

        // Generate Report into Generating Report State
        const generateReport = await axios.post(ENDPOINT, {
            query: GENERATE_REPORT_TO_GENERATE_REPORT_STATUS,
            variables: {
                "projectId": projectId,
                "algorithms": "aiverify.algorithms.partial_dependence_plot:partial_dependence_plot"
            }
        })

        expect(generateReport.data.data.generateReport.status).toBe("GeneratingReport") // need to check status

        // Cancel Test Run
        const response = await axios.post(ENDPOINT, {
            query: CANCEL_TEST_RUNS,
            variables: {
                "projectId": projectId,
                "algorithms": "aiverify.algorithms.partial_dependence_plot:partial_dependence_plot"
            }
        })

        const testRun = response.data.data.cancelTestRuns

        // Assert Response
        expect(testRun.status).toBe("ReportGenerated") // need to check status

    })

    test('Cancel Test Run with Invalid ID', async () => {

        //Send Request
        const response = await axios.post(ENDPOINT, {
            query: CANCEL_TEST_RUNS,
            variables: {
                "projectId": "63be7e9bd43d9b23db71ff1",
                "algorithms": "aiverify.algorithms.partial_dependence_plot:partial_dependence_plot"
            }
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$projectId\" got invalid value \"63be7e9bd43d9b23db71ff1\"; Value is not a valid mongodb object id of form: 63be7e9bd43d9b23db71ff1")

    })

    test('Cancel Test Run with Empty ID', async () => {

        //Send Request
        const response = await axios.post(ENDPOINT, {
            query: CANCEL_TEST_RUNS,
            variables: {
                "projectId": "",
                "algorithms": "aiverify.algorithms.partial_dependence_plot:partial_dependence_plot"
            }
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$projectId\" got invalid value \"\"; Value is not a valid mongodb object id of form: ")

    })

    test('Cancel Test Run with No Report', async () => {

        //Send Request
        const response = await axios.post(ENDPOINT, {
            query: CANCEL_TEST_RUNS,
            variables: {
                "projectId": "63be7e9bd43d9b23db71ff13",
                "algorithms": "aiverify.algorithms.partial_dependence_plot:partial_dependence_plot"
            }
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Unexpected error value: \"Report not found\"")

    })

    test('Cancel Test Run with Generating Report', async () => {

        //Create a Project
        const createProject = await axios.post(ENDPOINT, {
            query: CREATE_PROJECT,
            variables: PROJECT_VARIABLES
        })

        const projectId = createProject.data.data.createProject.id

        // Generate Report into Generating Report State
        const generateReport = await axios.post(ENDPOINT, {
            query: GENERATE_REPORT_TO_GENERATE_REPORT_STATUS,
            variables: {
                "projectId": projectId,
                "algorithms": "aiverify.algorithms.partial_dependence_plot:partial_dependence_plot"
            }
        })

        expect(generateReport.data.data.generateReport.status).toBe("GeneratingReport") // need to check status

        // Cancel Test Run
        const response = await axios.post(ENDPOINT, {
            query: CANCEL_TEST_RUNS,
            variables: {
                "projectId": projectId,
                "algorithms": "aiverify.algorithms.partial_dependence_plot:partial_dependence_plot"
            }
        })

        const testRun = response.data.data.cancelTestRuns

        // Assert Status
        expect(testRun.status).toBe("ReportGenerated")

    })

    test('Cancel Test Run with Running Test', async () => {

    })

    test('Cancel Test Run with Pending Test', async () => {

    })

    test('Cancel Test Run with Report Generated', async () => {

        //Send Request
        const response = await axios.post(ENDPOINT, {
            query: CANCEL_TEST_RUNS,
            variables: {
                "projectId": "63c9f1cad2a911b67dd0cd6d",
                "algorithms": "aiverify.algorithms.partial_dependence_plot:partial_dependence_plot"
            }
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Unexpected error value: \"Report is not generating\"")

    })

})