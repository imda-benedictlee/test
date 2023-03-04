import { test, expect } from '@playwright/test'
import { ObjectId } from 'mongodb'
import { projects } from './queries.spec.js';

import axios from 'axios';

const ENDPOINT = "http://localhost:4000/graphql"

const CREATE_PROJECT_TEMPLATE = `mutation CreateProjectTemplate($projectTemplate: ProjectTemplateInput!) {
    createProjectTemplate(projectTemplate: $projectTemplate) {
      id
      projectInfo {
        name
        description
        reportTitle
        company
      }
      globalVars {
        key
        value
      }
      pages {
        layouts
        reportWidgets {
          widgetGID
          key
          layoutItemProperties {
            justifyContent
            alignItems
            color
            bgcolor
          }
          properties
        }
      }
      createdAt
      updatedAt
    }
  }`

const CLONE_PROJECT_TEMPLATE = `mutation CloneProjectTemplate($cloneProjectTemplateId: ObjectID!) {
    cloneProjectTemplate(id: $cloneProjectTemplateId) {
      id
      projectInfo {
        name
        description
        reportTitle
        company
      }
      globalVars {
        key
        value
      }
      pages {
        layouts
        reportWidgets {
          widgetGID
          key
          layoutItemProperties {
            justifyContent
            alignItems
            color
            bgcolor
          }
          properties
        }
      }
      createdAt
      updatedAt
    }
  }`

const DELETE_PROJECT_TEMPLATE = `mutation DeleteProjectTemplate($deleteProjectTemplateId: ObjectID!) {
    deleteProjectTemplate(id: $deleteProjectTemplateId)
  }`

const UPDATE_PROJECT_TEMPLATE = `mutation DeleteProjectTemplate($updateProjectTemplateId: ObjectID!, $projectTemplate: ProjectTemplateInput!) {
    updateProjectTemplate(id: $updateProjectTemplateId, projectTemplate: $projectTemplate) {
      id
      fromPlugin
      projectInfo {
        name
        description
        reportTitle
        company
      }
      globalVars {
        key
        value
      }
      pages {
        layouts
        reportWidgets {
          widgetGID
          key
          layoutItemProperties {
            justifyContent
            alignItems
            color
            bgcolor
          }
          properties
        }
      }
      createdAt
      updatedAt
    }
  }`

  const PROJECT_TEMPLATE_VARIABLES = {
    "projectTemplate": {
        "projectInfo": {
            "name": "Template 3",
            "company": "Template 3",
            "description": "Template 3",
            "reportTitle": "Template 3"
        },
        "globalVars": [
            {
                "key": "20",
                "value": "30"
            },
            {
                "key": "30",
                "value": "30"
            }
        ],
        "pages": [
            {
                "layouts": {
                    "w": 1,
                    "h": 4,
                    "x": 5,
                    "y": 9,
                    "i": "1674113927768",
                    "minW": 1,
                    "maxW": 12,
                    "minH": 4,
                    "maxH": 37,
                    "moved": false,
                    "static": false
                },
                "reportWidgets": {
                    "widgetGID": "aiverify.tests:test2",
                    "key": "1675757519254",
                    "layoutItemProperties": {
                        "justifyContent": "left",
                        "alignItems": "top",
                        "color": null,
                        "bgcolor": null
                    },
                    "properties": null
                }
            }
        ],
    }
}

test.describe('Create Project Template', () => {

    test.skip('Create Project Template with Valid Inputs', async () => {

        //Send Request
        const response = await axios.post(ENDPOINT, {
            query: CREATE_PROJECT_TEMPLATE,
            variables: PROJECT_TEMPLATE_VARIABLES
        })

        const projectTemplateInfo = response.data.data.createProjectTemplate

        const projectTemplateId = projectTemplateInfo.id

        // Get Project Info directly from MongoDB
        const query = { _id: ObjectId(projectTemplateId) }
        const projectTemplateInfoObj = await projects.findOne(query)

        // Assert Response
        expect(projectTemplateInfo.projectInfo.name).toBe(projectTemplateInfoObj.projectInfo.name)
        expect(projectTemplateInfo.projectInfo.description).toBe(projectTemplateInfoObj.projectInfo.description)
        expect(projectTemplateInfo.projectInfo.reportTitle).toBe(projectTemplateInfoObj.projectInfo.reportTitle)
        expect(projectTemplateInfo.projectInfo.company).toBe(projectTemplateInfoObj.projectInfo.company)

        expect(projectTemplateInfo.pages[0].layouts).toMatchObject(projectTemplateInfoObj.pages[0].layouts)
        expect(projectTemplateInfo.pages[0].reportWidgets[0].widgetGID).toBe(projectTemplateInfoObj.pages[0].reportWidgets[0].widgetGID)
        expect(projectTemplateInfo.pages[0].reportWidgets[0].key).toBe(projectTemplateInfoObj.pages[0].reportWidgets[0].key)
        expect(projectTemplateInfo.pages[0].reportWidgets[0].layoutItemProperties).toMatchObject(projectTemplateInfoObj.pages[0].reportWidgets[0].layoutItemProperties)
        expect(projectTemplateInfo.pages[0].reportWidgets[0].properties).toBe(projectTemplateInfoObj.pages[0].reportWidgets[0].properties)

        expect(projectTemplateInfo.globalVars[0].key).toBe(projectTemplateInfoObj.globalVars[0].key)
        expect(projectTemplateInfo.globalVars[0].value).toBe(projectTemplateInfoObj.globalVars[0].value)

        expect(projectTemplateInfo.globalVars[1].key).toBe(projectTemplateInfoObj.globalVars[1].key)
        expect(projectTemplateInfo.globalVars[1].value).toBe(projectTemplateInfoObj.globalVars[1].value)
    })

    test.skip('Create Project Template with NULL Project Information', async () => {

        // GraphQL Query
        const gqlQuery = `mutation CreateProjectTemplate($projectTemplate: ProjectTemplateInput!) {
            createProjectTemplate(projectTemplate: $projectTemplate) {
              id
              projectInfo {
                name
                description
                reportTitle
                company
              }
            }
          }`

        // Get Current Count of Records
        const currentCount = await projects.countDocuments()

        // Test For Null Project Information
        let response = await axios.post(ENDPOINT, {
            query: gqlQuery,
            variables: {
                "projectTemplate": {
                    "projectInfo": {
                        "name": null,
                        "description": null,
                        "reportTitle": null,
                        "company": null
                    }
                }
            }
        })

        let errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Cannot return null for non-nullable field ProjectInformation.name.")

        // Get New Count of Records
        const newCount = await projects.countDocuments()

        //Assert Record Counts
        expect(newCount).toEqual(currentCount)

    })

    test.skip('Create Project Template with Integer Project Information', async () => {

        // GraphQL Query
        const gqlQuery = `mutation CreateProjectTemplate($projectTemplate: ProjectTemplateInput!) {
            createProjectTemplate(projectTemplate: $projectTemplate) {
              id
              projectInfo {
                name
                description
                reportTitle
                company
              }
            }
          }`

        // Get Current Count of Records
        const currentCount = await projects.countDocuments()

        // Test For Integer Project Information
        const response = await axios.post(ENDPOINT, {
            query: gqlQuery,
            variables: {
                "projectTemplate": {
                    "projectInfo": {
                        "name": 0,
                        "description": 0,
                        "reportTitle": 0,
                        "company": 0
                    }
                }
            }
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$projectTemplate\" got invalid value 0 at \"projectTemplate.projectInfo.name\"; String cannot represent a non string value: 0")
        expect(errorMessage[1].message).toBe("Variable \"$projectTemplate\" got invalid value 0 at \"projectTemplate.projectInfo.description\"; String cannot represent a non string value: 0")
        expect(errorMessage[2].message).toBe("Variable \"$projectTemplate\" got invalid value 0 at \"projectTemplate.projectInfo.reportTitle\"; String cannot represent a non string value: 0")
        expect(errorMessage[3].message).toBe("Variable \"$projectTemplate\" got invalid value 0 at \"projectTemplate.projectInfo.company\"; String cannot represent a non string value: 0")

        // Get New Count of Records
        const newCount = await projects.countDocuments()

        //Assert Record Counts
        expect(newCount).toEqual(currentCount)

    })

    test.skip('Create Project Template with Empty Project Information', async () => {

        // GraphQL Query
        const gqlQuery = `mutation CreateProjectTemplate($projectTemplate: ProjectTemplateInput!) {
            createProjectTemplate(projectTemplate: $projectTemplate) {
              id
              projectInfo {
                name
                description
                reportTitle
                company
              }
            }
          }`

        // Get Current Count of Records
        const currentCount = await projects.countDocuments()

        // Test For Empty Values
        const response = await axios.post(ENDPOINT, {
            query: gqlQuery,
            variables: {
                "projectTemplate": {
                    "projectInfo": {
                        "name": "",
                        "description": "",
                        "reportTitle": "",
                        "company": ""
                    }
                }
            }
        })

        // FIXME JIRA 185
        const projectTemplateInfo = response.data.data.createProjectTemplate
        const projectTemplateId = projectTemplateInfo.id

        // Get Project Info directly from MongoDB
        const query = { _id: ObjectId(projectTemplateId) }
        const projectTemplateInfoObj = await projects.findOne(query)

        // Assert Response
        expect(projectTemplateInfo.projectInfo.name).toBe(projectTemplateInfoObj.projectInfo.name)
        expect(projectTemplateInfo.projectInfo.description).toBe(projectTemplateInfoObj.projectInfo.description)
        expect(projectTemplateInfo.projectInfo.reportTitle).toBe(projectTemplateInfoObj.projectInfo.reportTitle)
        expect(projectTemplateInfo.projectInfo.company).toBe(projectTemplateInfoObj.projectInfo.company)

        // Get New Count of Records
        const newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)

    })

    test.skip('Create Project Template with Invalid Global Variable', async () => {

        // GraphQL Query
        const gqlQuery = `mutation Mutation($projectTemplate: ProjectTemplateInput!) {
            createProjectTemplate(projectTemplate: $projectTemplate) {
              globalVars {
                key
                value
              }
            }
          }`

        // Get Current Count of Records
        const currentCount = await projects.countDocuments()

        // Test For Null Global Variables
        let response = await axios.post(ENDPOINT, {
            query: gqlQuery,
            variables: {
                "projectTemplate": {
                    "globalVars": {
                        "key": null,
                        "value": null
                    }
                }
            }
        })

        let errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$projectTemplate\" got invalid value null at \"projectTemplate.globalVars.key\"; Expected non-nullable type \"String!\" not to be null.")
        expect(errorMessage[1].message).toBe("Variable \"$projectTemplate\" got invalid value null at \"projectTemplate.globalVars.value\"; Expected non-nullable type \"String!\" not to be null.")

        // Test For Integer Global Variables
        response = await axios.post(ENDPOINT, {
            query: gqlQuery,
            variables: {
                "projectTemplate": {
                    "globalVars": {
                        "key": 0,
                        "value": 0
                    }
                }
            }
        })

        errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$projectTemplate\" got invalid value 0 at \"projectTemplate.globalVars.key\"; String cannot represent a non string value: 0")
        expect(errorMessage[1].message).toBe("Variable \"$projectTemplate\" got invalid value 0 at \"projectTemplate.globalVars.value\"; String cannot represent a non string value: 0")

        // Get New Count of Records
        const newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)

    })

    test('Create Project Template with Empty Global Variable', async () => {

        // GraphQL Query
        const gqlQuery = `mutation Mutation($projectTemplate: ProjectTemplateInput!) {
            createProjectTemplate(projectTemplate: $projectTemplate) {
              globalVars {
                key
                value
              }
            }
          }`

        // Get Current Count of Records
        const currentCount = await projects.countDocuments()

        // Test For Empty Global Variables
        let response = await axios.post(ENDPOINT, {
            query: gqlQuery,
            variables: {
                "projectTemplate": {
                    "globalVars": {
                        "key": "",
                        "value": ""
                    }
                }
            }
        })

        // FIXME JIRA 188
        const errorMessage = response.data.errors

        const projectTemplateInfo = response.data.data.createProjectTemplate
        const projectTemplateId = projectTemplateInfo.id

        // Get Project Info directly from MongoDB
        const query = { _id: ObjectId(projectTemplateId) }
        const projectTemplateInfoObj = await projects.findOne(query)

        // Assert Response
        expect(projectTemplateInfo.globalVars.key).toBe(projectTemplateInfoObj.globalVars.key)
        expect(projectTemplateInfo.globalVars.value).toBe(projectTemplateInfoObj.globalVars.value)

        // Get New Count of Records
        const newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)

    })

    test.skip('Create Project Template with Invalid Pages', async () => {

        // GraphQL Query
        const gqlQuery = `mutation Mutation($projectTemplate: ProjectTemplateInput!) {
            createProjectTemplate(projectTemplate: $projectTemplate) {
              pages {
                layouts
              }
            }
          }`

        // Get Current Count of Records
        let currentCount = await projects.countDocuments()

        // Test For Null Values in Layouts
        let response = await axios.post(ENDPOINT, {
            query: gqlQuery,
            variables: {
                "projectTemplate": {
                    "pages": {
                        "layouts": {
                            "w": null,
                            "h": null,
                            "x": null,
                            "y": null,
                            "i": null,
                            "minW": null,
                            "maxW": null,
                            "minH": null,
                            "maxH": null,
                            "moved": null,
                            "static": null
                        }
                    }
                },
            }
        })

        // FIXME Allow insertion of NULL values in Layout? future
        let errorMessage = response.data.errors

        // Get New Count of Records
        let newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)

        // Test For Float Values in Layouts
        response = await axios.post(ENDPOINT, {
            query: gqlQuery,
            variables: {
                "projectTemplate": {
                    "pages": {
                        "layouts": {
                            "w": 0.1,
                            "h": 0.1,
                            "x": 0.1,
                            "y": 0.1,
                            "i": 0.1,
                            "minW": 0.1,
                            "maxW": 0.1,
                            "minH": 0.1,
                            "maxH": 0.1,
                            "moved": 0.1,
                            "static": 0.1
                        }
                    }
                },
            }
        })

        // FIXME Allow insertion of float values for boolean and integer fields? future
        errorMessage = response.data.errors

        // Get New Count of Records
        newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)

        // Test For Null Values in Report Widget
        response = await axios.post(ENDPOINT, {
            query: gqlQuery,
            variables: {
                "projectTemplates": {
                    "reportWidgets": {
                        "widgetGID": null,
                        "key": null,
                        "layoutItemProperties": {
                            "justifyContent": null,
                            "alignItems": null,
                            "color": null,
                            "bgcolor": null
                        },
                        "properties": null
                    }
                }
            }
        })

        errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$projectTemplate\" of required type \"ProjectTemplateInput!\" was not provided.")

        // Get New Count of Records
        newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)

        // Test For Integer Values in Report Widget
        response = await axios.post(ENDPOINT, {
            query: gqlQuery,
            variables: {
                "projectTemplates": {
                    "reportWidgets": {
                        "widgetGID": 0,
                        "key": 0,
                        "layoutItemProperties": {
                            "justifyContent": 0,
                            "alignItems": 0,
                            "color": 0,
                            "bgcolor": 0
                        },
                        "properties": 0
                    }
                }
            }
        })

        errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$projectTemplate\" of required type \"ProjectTemplateInput!\" was not provided.")

        // Get New Count of Records
        newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)

    })

    test.skip('Create Project Template with Empty Pages', async () => {

        // GraphQL Query
        const gqlQuery = `mutation Mutation($projectTemplate: ProjectTemplateInput!) {
            createProjectTemplate(projectTemplate: $projectTemplate) {
              pages {
                layouts
                reportWidgets {
                  widgetGID
                  key
                  layoutItemProperties {
                    justifyContent
                    alignItems
                    color
                    bgcolor
                  }
                  properties
                }
              }
            }
          }`

        // Get Current Count of Records
        const currentCount = await projects.countDocuments()

        // Test For Null Values in Layouts
        let response = await axios.post(ENDPOINT, {
            query: gqlQuery,
            variables: {
                "projectTemplate": {
                    "pages": [
                        {
                            "layouts": {
                                "w": "",
                                "h": "",
                                "x": "",
                                "y": "",
                                "i": "",
                                "minW": "",
                                "maxW": "",
                                "minH": "",
                                "maxH": "",
                                "moved": "",
                                "static": ""
                            },
                            "reportWidgets": {
                                "widgetGID": "",
                                "key": "",
                                "layoutItemProperties": {
                                    "justifyContent": "",
                                    "alignItems": "",
                                    "color": "",
                                    "bgcolor": ""
                                },
                                "properties": ""
                            }
                        }
                    ],
                }
            }
        })

        // FIXME JIRA 187
        const errorMessage = response.data.errors

        // Get New Count of Records
        const newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)

    })
})

test.skip('Clone Project Template', () => {

    let projectTemplateId
    let projectTemplate

    test.beforeAll(async () => {

        const response = await axios.post(ENDPOINT, {
            query: CREATE_PROJECT_TEMPLATE,
            variables: PROJECT_TEMPLATE_VARIABLES
        })

        projectTemplate = response.data.data.createProjectTemplate

        projectTemplateId = projectTemplate.id
    })

    test('Clone Project Template by Project Template ID', async () => {

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: CLONE_PROJECT_TEMPLATE,
            variables: {
                "cloneProjectTemplateId": projectTemplateId
            }
        })

        // Get Project Template ID of Cloned Project Template
        const clonedProjectTemplateId = response.data.data.cloneProjectTemplate.id

        // Get Cloned Project Template Info directly from MongoDB
        const query = { _id: ObjectId(clonedProjectTemplateId) };
        const clonedProjectTemplateObj = await projects.findOne(query)

        // Assert Response
        expect(clonedProjectTemplateObj.projectInfo.name).toBe("Copy of " + projectTemplate.projectInfo.name)
        expect(clonedProjectTemplateObj.projectInfo.company).toBe(projectTemplate.projectInfo.company)
    })

    test.skip('Clone Project Template by Invalid Project Template ID', async () => {

        // Get Current Count of Records
        const currentCount = await projects.countDocuments()

        // Clone Project Template with Non-existing Project Template ID
        let response = await axios.post(ENDPOINT, {
            query: CLONE_PROJECT_TEMPLATE,
            variables: {
                "cloneProjectTemplateId": "0000"
            }
        })

        let errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe('Variable "$cloneProjectTemplateId" got invalid value "0000"; Value is not a valid mongodb object id of form: 0000')

        // Get New Count of Records
        let newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)

        // Clone Project Template with Null Project Template ID
        response = await axios.post(ENDPOINT, {
            query: CLONE_PROJECT_TEMPLATE,
            variables: {
                "cloneProjectTemplateId": null
            }
        })

        errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe('Variable "$cloneProjectTemplateId" of non-null type "ObjectID!" must not be null.')

        // Get New Count of Records
        newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)

        // Clone Project Template with Integer Project Template ID
        response = await axios.post(ENDPOINT, {
            query: CLONE_PROJECT_TEMPLATE,
            variables: {
                "cloneProjectTemplateId": 0
            }
        })

        errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe('Variable "$cloneProjectTemplateId" got invalid value 0; Value is not a valid mongodb object id of form: 0')

        // Get New Count of Records
        newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)
    })

    test.skip('Clone Project Template by Empty Project Template ID', async () => {

        // Get Current Count of Records
        const currentCount = await projects.countDocuments()

        // Clone Project Template with Non-existing Project Template ID
        let response = await axios.post(ENDPOINT, {
            query: CLONE_PROJECT_TEMPLATE,
            variables: {
                "cloneProjectTemplateId": ""
            }
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe('Variable "$cloneProjectTemplateId" got invalid value ""; Value is not a valid mongodb object id of form: ')

        // Get New Count of Records
        const newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)
    })

})

test.describe('Delete Project Template', () => {

    let projectTemplateId
    let projectTemplate

    test.beforeAll(async () => {

        const response = await axios.post(ENDPOINT, {
            query: CREATE_PROJECT_TEMPLATE,
            variables: PROJECT_TEMPLATE_VARIABLES
        })

        projectTemplate = response.data.data.createProjectTemplate

        projectTemplateId = projectTemplate.id
    })

    test.skip('Delete Project Template by Project Template ID', async () => {

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: DELETE_PROJECT_TEMPLATE,
            variables: {
                "deleteProjectTemplateId": projectTemplateId
            }
        })

        const deleteProjectTemplateId = response.data.data.deleteProjectTemplate

        // Get Cloned Project Template Info directly from MongoDB
        const query = { _id: ObjectId(deleteProjectTemplateId) };
        const deletedProjectTemplateObj = await projects.findOne(query)

        // Assert Delete Project Template
        expect(deletedProjectTemplateObj).toBeNull
    })

    test.skip('Delete Project Template by Invalid Project Template ID', async () => {

        // Get Current Count of Records
        const currentCount = await projects.countDocuments()

        // Delete Project Template with Non-existing Project Template ID
        let response = await axios.post(ENDPOINT, {
            query: DELETE_PROJECT_TEMPLATE,
            variables: {
                "deleteProjectTemplateId": "0000"
            }
        })

        let errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe('Variable "$deleteProjectTemplateId" got invalid value "0000"; Value is not a valid mongodb object id of form: 0000')

        // Get New Count of Records
        let newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)

        // Delete Project Template with Null Project Template ID
        response = await axios.post(ENDPOINT, {
            query: DELETE_PROJECT_TEMPLATE,
            variables: {
                "deleteProjectTemplateId": null
            }
        })

        errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe('Variable "$deleteProjectTemplateId" of non-null type "ObjectID!" must not be null.')

        // Get New Count of Records
        newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)

        // Delete Project Template with Integer Project Template ID
        response = await axios.post(ENDPOINT, {
            query: DELETE_PROJECT_TEMPLATE,
            variables: {
                "deleteProjectTemplateId": 0
            }
        })

        errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe('Variable "$deleteProjectTemplateId" got invalid value 0; Value is not a valid mongodb object id of form: 0')

        // Get New Count of Records
        newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)
    })

    test.skip('Delete Project Template by Empty Project Template ID', async () => {

        // Get Current Count of Records
        const currentCount = await projects.countDocuments()

        // Delete Project Template with Non-existing Project Template ID
        let response = await axios.post(ENDPOINT, {
            query: DELETE_PROJECT_TEMPLATE,
            variables: {
                "deleteProjectTemplateId": ""
            }
        })

        let errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe('Variable "$deleteProjectTemplateId" got invalid value ""; Value is not a valid mongodb object id of form: ')

        // Get New Count of Records
        const newCount = await projects.countDocuments()

        // Assert Record Counts
        expect(newCount).toEqual(currentCount)
    })
})

test.skip('Update Project Template', () => {

    let projectTemplateId
    let projectTemplate

    test.beforeAll(async () => {

        const response = await axios.post(ENDPOINT, {
            query: CREATE_PROJECT_TEMPLATE,
            variables: PROJECT_TEMPLATE_VARIABLES
        })

        projectTemplate = response.data.data.createProjectTemplate

        projectTemplateId = projectTemplate.id

    })

    test.skip('Update Project Template by Project Template ID', async () => {

        const data = "Template 10"

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "updateProjectTemplateId": projectTemplateId,
                "projectTemplate": {
                    "projectInfo": {
                        "name": data,
                        "description": data,
                    }
                }
            }
        })

        // Get Project Template ID of Updated Project Template
        const updatedProjectTemplateId = response.data.data.updateProjectTemplate.id

        // Get Updated Project Template Info directly from MongoDB
        const query = { _id: ObjectId(updatedProjectTemplateId) }
        const updatedProjectTemplateObj = await projects.findOne(query)

        // Assert Response
        expect(updatedProjectTemplateObj.projectInfo.name).toBe(data)
        expect(updatedProjectTemplateObj.projectInfo.description).toBe(data)

    })

    test.skip('Update Project Template with Invalid Project Template ID', async () => {

        const data = "Template 19"

        // Test for Null Project Template ID

        // Send Request
        let response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "updateProjectTemplateId": null,
                "projectTemplate": {
                    "projectInfo": {
                        "name": data,
                        "description": data,
                    }
                }
            }
        })

        let errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$updateProjectTemplateId\" of non-null type \"ObjectID!\" must not be null.")

        // Get Project Template Info directly from MongoDB
        let query = { _id: ObjectId(projectTemplateId) }
        let updatedProjectTemplateObj = await projects.findOne(query)

        // Assert Response
        expect(updatedProjectTemplateObj.projectInfo.name).not.toBe(data)
        expect(updatedProjectTemplateObj.projectInfo.description).not.toBe(data)

        // Test for Integer Project Template ID
        response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "updateProjectTemplateId": 0,
                "projectTemplate": {
                    "projectInfo": {
                        "name": data,
                        "description": data,
                    }
                }
            }
        })

        errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$updateProjectTemplateId\" got invalid value 0; Value is not a valid mongodb object id of form: 0")

        // Get Project Template Info directly from MongoDB
        query = { _id: ObjectId(projectTemplateId) }
        updatedProjectTemplateObj = await projects.findOne(query)

        // Assert Response
        expect(updatedProjectTemplateObj.projectInfo.name).not.toBe(data)
        expect(updatedProjectTemplateObj.projectInfo.description).not.toBe(data)

        // Test For Non-existing Project Template ID
        response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "updateProjectTemplateId": "100",
                "projectTemplate": {
                    "projectInfo": {
                        "name": data,
                        "description": data,
                    }
                }
            }
        })

        errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$updateProjectTemplateId\" got invalid value \"100\"; Value is not a valid mongodb object id of form: 100")

        // Get Project Template Info directly from MongoDB
        query = { _id: ObjectId(projectTemplateId) }
        updatedProjectTemplateObj = await projects.findOne(query)

        // Assert Response
        expect(updatedProjectTemplateObj.projectInfo.name).not.toBe(data)
        expect(updatedProjectTemplateObj.projectInfo.description).not.toBe(data)

    })

    test.skip('Update Project Template with Empty Project Template ID', async () => {

        const data = "Template 45"

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "updateProjectTemplateId": "",
                "projectTemplate": {
                    "projectInfo": {
                        "name": data,
                        "description": data,
                    }
                }
            }
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$updateProjectTemplateId\" got invalid value \"\"; Value is not a valid mongodb object id of form: ")

        // Get Project Template Info directly from MongoDB
        const query = { _id: ObjectId(projectTemplateId) }
        const updatedProjectTemplateObj = await projects.findOne(query)

        // Assert Response
        expect(updatedProjectTemplateObj.projectInfo.name).not.toBe(data)
        expect(updatedProjectTemplateObj.projectInfo.description).not.toBe(data)

    })

    test.skip('Update Project Template with Valid Inputs', async () => {

        const data = {
            "name": "Template 3",
            "description": "Template 4",
            "globalVarsKey": "Time",
            "value": "30",
            "widgetGID": "aiverify.tests:test3",
            "widgetKey": "1675757519254"
        }

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "updateProjectTemplateId": projectTemplateId,
                "projectTemplate":
                {
                    "projectInfo": {
                        "name": data.name,
                        "description": data.description
                    },
                    "globalVars": {
                        "key": data.globalVarsKey,
                        "value": data.value
                    },
                    "pages": {
                        "reportWidgets": [{
                            "widgetGID": data.widgetGID,
                            "key": data.widgetKey
                        }]
                    }

                }
            }
        })

        // Get Project Template ID of Updated Project Template
        const updatedProjectTemplateId = response.data.data.updateProjectTemplate.id

        // Get Updated Project Template Info directly from MongoDB
        const query = { _id: ObjectId(updatedProjectTemplateId) }
        const updatedProjectTemplateObj = await projects.findOne(query)

        // Assert Response
        expect(updatedProjectTemplateObj.projectInfo.name).toBe(data.name)
        expect(updatedProjectTemplateObj.projectInfo.description).toBe(data.description)

        expect(updatedProjectTemplateObj.globalVars[0].key).toBe(data.globalVarsKey)
        expect(updatedProjectTemplateObj.globalVars[0].value).toBe(data.value)

        expect(updatedProjectTemplateObj.pages[0].reportWidgets[0].widgetGID).toBe(data.widgetGID)
        expect(updatedProjectTemplateObj.pages[0].reportWidgets[0].key).toBe(data.widgetKey)

    })

    test.skip('Update Project Template with Invalid Project Information', async () => {

        // Test For Null Project Information
        let response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "updateProjectTemplateId": projectTemplateId,
                "variables": {
                    "updateProjectTemplateId": projectTemplateId,
                    "projectTemplate": {
                        "projectInfo": {
                            "name": null,
                            "description": null,
                        }
                    }
                }
            }
        })

        let errorMessage = response.data.errors

        expect(errorMessage[0].message).toBe("Variable \"$projectTemplate\" of required type \"ProjectTemplateInput!\" was not provided.")

        // Get Project Template Info directly from MongoDB
        let query = { _id: ObjectId(projectTemplateId) }
        let updatedProjectTemplateObj = await projects.findOne(query)

        // Assert Response
        expect(updatedProjectTemplateObj.projectInfo.name).not.toBeNull
        expect(updatedProjectTemplateObj.projectInfo.description).not.toBeNull

        // Test For Integer Project Information
        response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "updateProjectTemplateId": projectTemplateId,
                "variables": {
                    "updateProjectTemplateId": projectTemplateId,
                    "projectTemplate": {
                        "projectInfo": {
                            "name": 0,
                            "description": 0,
                        }
                    }
                }
            }
        })

        errorMessage = response.data.errors

        expect(errorMessage[0].message).toBe("Variable \"$projectTemplate\" of required type \"ProjectTemplateInput!\" was not provided.")

        // Get Project Template Info directly from MongoDB
        query = { _id: ObjectId(projectTemplateId) }
        updatedProjectTemplateObj = await projects.findOne(query)

        // Assert Response
        expect(updatedProjectTemplateObj.projectInfo.name).not.toBe(0)
        expect(updatedProjectTemplateObj.projectInfo.description).not.toBe(0)

    })

    test.skip('Update Project Template with Empty Project Information', async () => {

        const data = ""

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "updateProjectTemplateId": projectTemplateId,
                "projectTemplate": {
                    "projectInfo": {
                        "name": data,
                        "description": data,
                    }
                }
            }
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$projectTemplate\" got invalid value \"\" at \"projectTemplate.projectInfo.name\"; Expected type \"name_String_minLength_1_maxLength_128\". Must be at least 1 characters in length")

        // Get Project Template Info directly from MongoDB
        const query = { _id: ObjectId(projectTemplateId) }
        const updatedProjectTemplateObj = await projects.findOne(query)

        // Assert Response
        expect(updatedProjectTemplateObj.projectInfo.name).not.toBe(data)
        expect(updatedProjectTemplateObj.projectInfo.description).not.toBe(data)

    })

    test('Update Project Template with Invalid Global Variables', async () => {

        // Test For Null Global Variables
        let response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "updateProjectTemplateId": projectTemplateId,
                "projectTemplate": {
                    "globalVars": [
                        {
                            "key": null,
                            "value": null
                        }
                    ]
                }
            }
        })

        let errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$projectTemplate\" got invalid value null at \"projectTemplate.globalVars[0].key\"; Expected non-nullable type \"key_String_NotNull_minLength_1_maxLength_128!\" not to be null.")
        expect(errorMessage[1].message).toBe("Variable \"$projectTemplate\" got invalid value null at \"projectTemplate.globalVars[0].value\"; Expected non-nullable type \"value_String_NotNull_minLength_1_maxLength_128!\" not to be null.")

        // Get Project Template Info directly from MongoDB
        let query = { _id: ObjectId(projectTemplateId) }
        let updatedProjectTemplateObj = await projects.findOne(query)

        // Assert Response
        expect(updatedProjectTemplateObj.globalVars.key).not.toBeNull
        expect(updatedProjectTemplateObj.globalVars.value).not.toBeNull

        // Test For Integer Global Variables
        response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "updateProjectTemplateId": projectTemplateId,
                "projectTemplate": {
                    "globalVars": [
                        {
                            "key": 0, 
                            "value": 0
                        }
                    ]
                }
            }
        })

        errorMessage = response.data.errors

        //Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$projectTemplate\" got invalid value \"\" at \"projectTemplate.globalVars[0].key\"; Expected type \"key_String_NotNull_minLength_1_maxLength_128\". Must be at least 1 characters in length")
        expect(errorMessage[1].message).toBe("Variable \"$projectTemplate\" got invalid value \"\" at \"projectTemplate.globalVars[0].key\"; Expected type \"key_String_NotNull_minLength_1_maxLength_128\". Must be at least 1 characters in length")

        // Get Project Template Info directly from MongoDB
        query = { _id: ObjectId(projectTemplateId) }
        updatedProjectTemplateObj = await projects.findOne(query)

        // Assert Response
        expect(updatedProjectTemplateObj.globalVars.key).not.toBe(0)
        expect(updatedProjectTemplateObj.globalVars.value).not.toBe(0)

    })

    test.skip('Update Project Template with Empty Global Variables', async () => {

        const data = ""

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "updateProjectTemplateId": projectTemplateId,
                "projectTemplate": {
                    "globalVars": [
                        {
                            "key": "",
                            "value": ""
                        }
                    ]
                }
            }
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$projectTemplate\" got invalid value \"\" at \"projectTemplate.globalVars[0].key\"; Expected type \"key_String_NotNull_minLength_1_maxLength_128\". Must be at least 1 characters in length")
        expect(errorMessage[1].message).toBe("Variable \"$projectTemplate\" got invalid value \"\" at \"projectTemplate.globalVars[0].value\"; Expected type \"value_String_NotNull_minLength_1_maxLength_128\". Must be at least 1 characters in length")

        // Get Project Template Info directly from MongoDB
        const query = { _id: ObjectId(projectTemplateId) }
        const updatedProjectTemplateObj = await projects.findOne(query)

        // Assert Response
        expect(updatedProjectTemplateObj.globalVars.key).not.toBe(data)
        expect(updatedProjectTemplateObj.globalVars.value).not.toBe(data)

    })

    test.skip('Update Project Template with Invalid Pages', async () => {

        // Test For Null Values in Layouts
        let response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "projectTemplate": {
                    "pages": {
                        "layouts": {
                            "w": null,
                            "h": null,
                            "x": null,
                            "y": null,
                            "i": null,
                            "minW": null,
                            "maxW": null,
                            "minH": null,
                            "maxH": null,
                            "moved": null,
                            "static": null
                        }
                    }
                },
            }
        })

        let errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$updateProjectTemplateId\" of required type \"ObjectID!\" was not provided.")

        // Test For Float Values in Layouts
        response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "projectTemplate": {
                    "pages": {
                        "layouts": {
                            "w": 0.1,
                            "h": 0.1,
                            "x": 0.1,
                            "y": 0.1,
                            "i": 0.1,
                            "minW": 0.1,
                            "maxW": 0.1,
                            "minH": 0.1,
                            "maxH": 0.1,
                            "moved": 0.1,
                            "static": 0.1
                        }
                    }
                },
            }
        })

        errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$updateProjectTemplateId\" of required type \"ObjectID!\" was not provided.")

        // Test For Null Values in Report Widget
        response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "projectTemplates": {
                    "reportWidgets": {
                        "widgetGID": null,
                        "key": null,
                        "layoutItemProperties": {
                            "justifyContent": null,
                            "alignItems": null,
                            "color": null,
                            "bgcolor": null
                        },
                        "properties": null
                    }
                }
            }
        })

        errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$updateProjectTemplateId\" of required type \"ObjectID!\" was not provided.")

        // Test For Integer Values in Report Widget
        response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "projectTemplates": {
                    "reportWidgets": {
                        "widgetGID": 0,
                        "key": 0,
                        "layoutItemProperties": {
                            "justifyContent": 0,
                            "alignItems": 0,
                            "color": 0,
                            "bgcolor": 0
                        },
                        "properties": 0
                    }
                }
            }
        })

        errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$updateProjectTemplateId\" of required type \"ObjectID!\" was not provided.")

    })

    test.skip('Update Project Template with Empty Pages', async () => {

        const data = ""

        // Send Request
        const response = await axios.post(ENDPOINT, {
            query: UPDATE_PROJECT_TEMPLATE,
            variables: {
                "updateProjectTemplateId": projectTemplateId,
                "projectTemplate": {
                    "pages": [
                        {
                            "layouts": data,
                            "reportWidgets": [
                                {
                                    "widgetGID": data,
                                    "key": data,
                                    "layoutItemProperties": {
                                        "bgcolor": data,
                                        "color": data,
                                        "alignItems": data,
                                        "justifyContent": data
                                    },
                                    "properties": data
                                }
                            ]
                        }
                    ]
                }
            }
        })

        const errorMessage = response.data.errors

        // Assert Response
        expect(errorMessage[0].message).toBe("Variable \"$projectTemplate\" got invalid value \"\" at \"projectTemplate.pages[0].reportWidgets[0].widgetGID\"; Expected type \"widgetGID_String_NotNull_minLength_1_maxLength_128\". Must be at least 1 characters in length")
        expect(errorMessage[1].message).toBe("Variable \"$projectTemplate\" got invalid value \"\" at \"projectTemplate.pages[0].reportWidgets[0].key\"; Expected type \"key_String_minLength_1_maxLength_128\". Must be at least 1 characters in length")

        // Get Project Template Info directly from MongoDB
        const query = { _id: ObjectId(projectTemplateId) }
        const updatedProjectTemplateObj = await projects.findOne(query)

        // Assert Response
        expect(updatedProjectTemplateObj.globalVars.key).not.toBe(data)
        expect(updatedProjectTemplateObj.globalVars.value).not.toBe(data)

    })

})