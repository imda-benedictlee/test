import { test, expect } from '@playwright/test'
import { MongoClient, ObjectId } from 'mongodb'

import axios from 'axios';

const ENDPOINT = "http://localhost:4000/graphql"

const uri =
  "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1";
const mongoClient = new MongoClient(uri)
const database = mongoClient.db('aiverify')
export const projects = database.collection('projecttemplatemodels')

const GET_PROJECT_TEMPLATES = `query ProjectTemplates {
    projectTemplates {
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
  
  const GET_PROJECT_TEMPLATE_BY_PROJECT_TEMPLATE_ID = `query Project($projectTemplateId: ObjectID!) {
    projectTemplate(id: $projectTemplateId) {
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

  test.describe('Get Project Template', () => {

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
  
    test.skip('Get Project Templates', async () => {
  
      // Get All Project Templates
      const response = await axios.post(ENDPOINT, {
        query: GET_PROJECT_TEMPLATES
      })
  
      const output = response.data.data.projectTemplates
      let projectTemplateId = output[33].id
  
      // Get 34th Project Template Info directly from MongoDB
      let query = { _id: ObjectId(projectTemplateId) }
      let projectTemplateInfoObj = await projects.findOne(query)
  
      // Assert 34th Project Template
      expect(output[33].projectInfo.name).toBe(projectTemplateInfoObj.projectInfo.name)
      expect(output[33].projectInfo.description).toBe(projectTemplateInfoObj.projectInfo.description)
      expect(output[33].projectInfo.company).toBe(projectTemplateInfoObj.projectInfo.company)
  
      expect(output[33].pages[0].layouts).toMatchObject(projectTemplateInfoObj.pages[0].layouts)
      expect(output[33].pages[0].reportWidgets[0].widgetGID).toBe(projectTemplateInfoObj.pages[0].reportWidgets[0].widgetGID)
      expect(output[33].pages[0].reportWidgets[0].key).toBe(projectTemplateInfoObj.pages[0].reportWidgets[0].key)
      expect(output[33].pages[0].reportWidgets[0].layoutItemProperties).toMatchObject(projectTemplateInfoObj.pages[0].reportWidgets[0].layoutItemProperties)
      expect(output[33].pages[0].reportWidgets[0].properties).toBe(projectTemplateInfoObj.pages[0].reportWidgets[0].properties)
  
      expect(Date(output[33].createdAt)).toBe(Date(projectTemplateInfoObj.createdAt))
      expect(Date(output[33].updatedAt)).toBe(Date(projectTemplateInfoObj.updatedAt))
  
      projectTemplateId = output[34].id
  
      // Get 35th Project Template Info directly from MongoDB
      query = { _id: ObjectId(projectTemplateId) }
      projectTemplateInfoObj = await projects.findOne(query)
  
      // Assert 35th Project Template
      expect(output[35].projectInfo.name).toBe(projectTemplateInfoObj.projectInfo.name)
      expect(output[35].projectInfo.description).toBe(projectTemplateInfoObj.projectInfo.description)
      expect(output[35].projectInfo.company).toBe(projectTemplateInfoObj.projectInfo.company)
  
      expect(output[35].pages[0].layouts).toMatchObject(projectTemplateInfoObj.pages[0].layouts)
      expect(output[35].pages[0].reportWidgets[0].widgetGID).toBe(projectTemplateInfoObj.pages[0].reportWidgets[0].widgetGID)
      expect(output[35].pages[0].reportWidgets[0].key).toBe(projectTemplateInfoObj.pages[0].reportWidgets[0].key)
      expect(output[35].pages[0].reportWidgets[0].layoutItemProperties).toMatchObject(projectTemplateInfoObj.pages[0].reportWidgets[0].layoutItemProperties)
      expect(output[35].pages[0].reportWidgets[0].properties).toBe(projectTemplateInfoObj.pages[0].reportWidgets[0].properties)
  
      expect(Date(output[35].createdAt)).toBe(Date(projectTemplateInfoObj.createdAt))
      expect(Date(output[35].updatedAt)).toBe(Date(projectTemplateInfoObj.updatedAt))
    })
  
    test.skip('Get Project Template by Project Template Id', async () => {
  
      // Get Response
      const response = await axios.post(ENDPOINT, {
        query: GET_PROJECT_TEMPLATE_BY_PROJECT_TEMPLATE_ID,
        variables: {
          "projectTemplateId": projectTemplateId
        }
      })
  
      const projectTemplateInfo = response.data.data.projectTemplate
  
      // Get Project Info directly from MongoDB
      const query = { _id: ObjectId(projectTemplateId) }
      const projectTemplateInfoObj = await projects.findOne(query)
  
      // Assert Response
      expect(projectTemplateInfo.projectInfo.name).toBe(projectTemplateInfoObj.projectInfo.name)
      expect(projectTemplateInfo.projectInfo.description).toBe(projectTemplateInfoObj.projectInfo.description)
      expect(projectTemplateInfo.projectInfo.company).toBe(projectTemplateInfoObj.projectInfo.company)
  
      expect(projectTemplateInfo.pages[0].layouts).toMatchObject(projectTemplateInfoObj.pages[0].layouts)
      expect(projectTemplateInfo.pages[0].reportWidgets[0].widgetGID).toBe(projectTemplateInfoObj.pages[0].reportWidgets[0].widgetGID)
      expect(projectTemplateInfo.pages[0].reportWidgets[0].key).toBe(projectTemplateInfoObj.pages[0].reportWidgets[0].key)
      expect(projectTemplateInfo.pages[0].reportWidgets[0].layoutItemProperties).toMatchObject(projectTemplateInfoObj.pages[0].reportWidgets[0].layoutItemProperties)
      expect(projectTemplateInfo.pages[0].reportWidgets[0].properties).toBe(projectTemplateInfoObj.pages[0].reportWidgets[0].properties)
  
      expect(Date(projectTemplateInfo.createdAt)).toBe(Date(projectTemplateInfoObj.createdAt))
      expect(Date(projectTemplateInfo.updatedAt)).toBe(Date(projectTemplateInfoObj.updatedAt))
    })
  
    test.skip('Get Project Template by Invalid Project Template Id', async () => {
  
      // Test For NULL Project Template ID
      let response = await axios.post(ENDPOINT, {
        query: GET_PROJECT_TEMPLATE_BY_PROJECT_TEMPLATE_ID,
        variables: {
          "projectTemplateId": null
        }
      })
  
      let errorMessage = response.data.errors
  
      // Assert Response
      expect(errorMessage[0].message).toBe('Variable "$projectTemplateId" of non-null type "ObjectID!" must not be null.')
  
      // Test For Integer Project Template ID
      response = await axios.post(ENDPOINT, {
        query: GET_PROJECT_TEMPLATE_BY_PROJECT_TEMPLATE_ID,
        variables: {
          "projectTemplateId": 0
        }
      })
  
      errorMessage = response.data.errors
  
      // Assert Response
      expect(errorMessage[0].message).toBe('Variable "$projectTemplateId" got invalid value 0; Value is not a valid mongodb object id of form: 0')    
  
      // Test For Non-existing Project Template ID
      response = await axios.post(ENDPOINT, {
        query: GET_PROJECT_TEMPLATE_BY_PROJECT_TEMPLATE_ID,
        variables: {
          "projectTemplateId": "63e207c7fb46f9de3ab2508"
        }
      })
  
      errorMessage = response.data.errors
  
      // Assert Response
      expect(errorMessage[0].message).toBe('Variable "$projectTemplateId" got invalid value "63e207c7fb46f9de3ab2508"; Value is not a valid mongodb object id of form: 63e207c7fb46f9de3ab2508')
    })
  
    test.skip('Get Project Template by Empty Project Template Id', async () => {
  
      // Get Response
      const response = await axios.post(ENDPOINT, {
        query: GET_PROJECT_TEMPLATE_BY_PROJECT_TEMPLATE_ID,
        variables: {
          "projectTemplateId": ""
        }
      })
  
      const errorMessage = response.data.errors
  
      // Assert Response
      expect(errorMessage[0].message).toBe('Variable "$projectTemplateId" got invalid value ""; Value is not a valid mongodb object id of form: ')
    })
  
  })