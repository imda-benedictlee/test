import { test, expect } from '@playwright/test'
import { MongoClient, ObjectId } from 'mongodb'

import axios from 'axios';

const ENDPOINT = "http://localhost:4000/graphql"

const uri =
  "mongodb://mongodb:mongodb@127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1";
const mongoClient = new MongoClient(uri)
const database = mongoClient.db('aiverify')
export const projects = database.collection('projecttemplatemodels')
const reports = database.collection('reportmodels')

// GraphQL Query
const GET_PROJECTS = `query Query {
  projects {
    projectInfo {
      company
      description
      name
      reportTitle
    }
  }
}`

const GET_PROJECT_BY_ID = `query Query($projectId: ObjectID!) {
  project(id: $projectId) {
    projectInfo {
      name
      description
      company
      reportTitle
    }
  }
}`

const GET_REPORT_BY_PROJECT_ID = `query Query($projectId: ObjectID!) {
  report(projectID: $projectId) {
    projectID
    status
    timeStart
    timeTaken
    totalTestTimeTaken
    inputBlockData
  }
}`

test.describe('Get Project', () => {

  test('Get Projects', async () => {

    test.info().annotations.push({ type: 'testrail_case_field', description: 'preconds:Test Pre-conditions' });
    test.info().annotations.push({ type: 'testrail_result_field', description: 'version:AI Verify 1.0.0' });

    // Get Response
    const response = await axios.post(ENDPOINT, {
      query: GET_PROJECTS
    })

    const output = response.data.data.projects

    // Get Project Info directly from MongoDB
    const projectInfoObj = await projects.find({}).sort({ _id: 1 }).limit(2).toArray();

    // Assert Response
    expect(output[0].projectInfo.name).toBe(projectInfoObj[0].projectInfo.name)
    expect(output[0].projectInfo.description).toBe(projectInfoObj[0].projectInfo.description)
    expect(output[0].projectInfo.reportTitle).toBe(projectInfoObj[0].projectInfo.reportTitle)
    expect(output[0].projectInfo.company).toBe(projectInfoObj[0].projectInfo.company)

    expect(output[1].projectInfo.name).toBe(projectInfoObj[1].projectInfo.name)
    expect(output[1].projectInfo.description).toBe(projectInfoObj[1].projectInfo.description)
    expect(output[1].projectInfo.reportTitle).toBe(projectInfoObj[1].projectInfo.reportTitle)
    expect(output[1].projectInfo.company).toBe(projectInfoObj[1].projectInfo.company)
  })

  test('Get Project By Project ID', async () => {

    // Get Response
    const response = await axios.post(ENDPOINT, {
      query: GET_PROJECT_BY_ID,
      variables: {
        "projectId": "63b53a46c05b0b2df748f42d"
      }
    })

    const output = response.data.data.project

    // Get Project Info directly from MongoDB
    const query = { _id: ObjectId("63b53a46c05b0b2df748f42d") }
    const projectInfoObj = await projects.findOne(query)

    // Assert Response
    expect(output.projectInfo.name).toBe(projectInfoObj.projectInfo.name)
    expect(output.projectInfo.description).toBe(projectInfoObj.projectInfo.description)
    expect(output.projectInfo.reportTitle).toBe(projectInfoObj.projectInfo.reportTitle)
    expect(output.projectInfo.company).toBe(projectInfoObj.projectInfo.company)
  })

  test('Get Project By Invalid Project ID', async () => {

    // Get Response
    const response = await axios.post(ENDPOINT, {
      query: GET_PROJECT_BY_ID,
      variables: {
        "projectId": "63b53adfc05b0b2df748f43"
      }
    })

    const errorMessage = response.data.errors

    // Assert Response
    expect(errorMessage[0].extensions.code).toBe('BAD_USER_INPUT')
  })

  test('Get Project By Empty Project ID', async () => {

    // Get Response
    const response = await axios.post(ENDPOINT, {
      query: GET_PROJECT_BY_ID,
      variables: {
        "projectId": ""
      }
    })

    const errorMessage = response.data.errors

    // Assert Response
    expect(errorMessage[0].extensions.code).toBe('BAD_USER_INPUT')
  })

})

test.describe('Get Reports', () => {

  test('Get Report By Project ID', async () => {

    // Get Response
    const response = await axios.post(ENDPOINT, {
      query: GET_REPORT_BY_PROJECT_ID,
      variables: {
        "projectId": "63c9fa927bb6a2b36229fa00"
      }
    })

    const reportInfo = response.data.data.report

    // Get Report directly from MongoDB
    const query = { _id: ObjectId("63c9fa927bb6a2b36229fa00") }
    const reportId = (await projects.findOne(query)).report

    const query2 = { _id: ObjectId(reportId) }
    const reportInfoObj = (await reports.findOne(query2))

    // Assert Response
    expect(reportInfo.projectId).toBe(reportInfo._id)
    expect(reportInfo.status).toBe(reportInfoObj.status)
    expect(Date(reportInfo.timeStart)).toBe(Date(reportInfoObj.timeStart))
    expect(reportInfo.timeTaken).toBe(reportInfoObj.timeTaken)
    expect(reportInfo.totalTimeTaken).toBe(reportInfoObj.totalTimeTaken)
    expect(reportInfo.inputBlockData).toEqual(reportInfoObj.inputBlockData)

  })

  test('Get Report By Invalid Project ID', async () => {

    // Get Response
    const response = await axios.post(ENDPOINT, {
      query: GET_REPORT_BY_PROJECT_ID,
      variables: {
        "projectId": "63b518f4c05b0b2df748f418"
      }
    })

    const errorMessage = response.data.errors

    // Get Report Info directly from MongoDB
    const query = { _id: ObjectId("63b518f4c05b0b2df748f418") }
    const reportInfoObj = await projects.findOne(query)

    // Assert Response
    expect(errorMessage[0].extensions.code).toBe('INTERNAL_SERVER_ERROR')
    expect(reportInfoObj).toBeNull
  })

  test('Get Report By Empty Project ID', async () => {

    // Get Response
    const response = await axios.post(ENDPOINT, {
      query: GET_REPORT_BY_PROJECT_ID,
      variables: {
        "projectId": ""
      }
    })

    const errorMessage = response.data.errors

    // Assert Response
    expect(errorMessage[0].extensions.code).toBe('BAD_USER_INPUT')
  })
})