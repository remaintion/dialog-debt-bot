const functions = require('firebase-functions');
const admin = require('firebase-admin')
const { WebhookClient } = require('dialogflow-fulfillment')

admin.initializeApp()



exports.dialogflowFullfilment = functions.https.onRequest((req, res) => {
  const agent = new WebhookClient({ request: req, response: res })
  const intentMap = new Map()
  intentMap.set('Add User', addUser)
  intentMap.set('View Users', viewUsers)
  agent.handleRequest(intentMap)
})

const viewUsers = agent => new Promise((resolve, reject) => {
  if (agent.originalRequest.source !== 'line') {
    agent.add('ทำไมไม่ส่งมาทางไลน์ละคับ')
    return resolve()
  }
  agent.add('กำลังดูรายชื่อให้อยู่คับบบบ')
  const source = agent.originalRequest.payload.data.source
  const id = source.roomId || source.userId
  return admin.database().ref(`contacts/${id}`).once('value', snapshot => {
    if (!snapshot.exists()) {
      return agent.add('ไม่เจอรายชื่ออะน้อง')
    }
    const result = []
    snapshot.forEach(s => {
      const value = s.val()
      result.push(`${value.name}: ${value.promptpay}`)
    })
    return agent.add(result.join('\n'))
  })
    .then(() => resolve())
    .catch(err => reject(err))
})
const addUser = agent => new Promise((resolve, reject) => {
  console.log(agent.originalRequest)
  console.log('WTF')
  console.log(agent.parameters)
  if (agent.originalRequest.source !== 'line') {
    agent.add('ทำไมไม่ส่งมาทางไลน์ละคับ')
    return resolve()
  }
  agent.add('กำลังเพิ่มใส่บัญชีทวงหนี้อยู่จ้า')
  const contact = agent.parameters.any
  const promptpay = agent.parameters.any1
  const source = agent.originalRequest.payload.data.source
  const id = source.roomId || source.userId
  return admin.database().ref(`contacts/${id}/${contact}`).set({
    name: contact,
    promptpay,
  })
    .then(() => agent.add('เพิ่มรายชื่อให้แล้วคับ'))
    .then(() => resolve())
    .catch(err => reject(err))
})


