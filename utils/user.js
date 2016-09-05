const fs = require('fs')
const faker = require('faker')
const mailgun = require('mailgun-js')
const uuid = require('node-uuid')
const config = require('./config.json')

const domain = config.domain
const apiKey = config.apiKey
const batchSize = config.batchSize
const mailingList = config.mailingList
const sendDelay = config.sendDelay
console.log(config.sendDelay)
// console.log(mailingList)
const messageData = config.messageData
messageData.to = mailingList.address

const mg = mailgun({apiKey, domain})

const membersList = fs.readFileSync('mails.txt').toString().replace(/\r\n/g,'\n').split('\n')

const members = membersList.map((mail, i) => {
   return {
    name: faker.fake("{{name.firstName}}"),
    address: mail,
    // id: faker.random.uuid(),
    vars: {age: Math.floor(Math.random() * 80)}
  }
})

function* memberSubset () {
  while (members.length > 0) {
    members.length % batchSize <= 1 ? yield members.splice(0, batchSize) : yield members.splice(0)
  }
}

const createMailingList = () => {
  return new Promise((resolve, reject) => {
    mailingList.address = `${uuid.v4()}@${domain}`
    mg.lists().create(mailingList, (err, body) => {
      if (err) return reject(err)
      return resolve(body)
    })
  })
}

const mgJobID = setInterval(() => {
  // genrates the batchSize specified by splicing original list

  const mgStatus = memberSubset().next()
  // checks if members list is empty
  members.length == 0 ? clearInterval(mgJobID) : null
  // Create mailing list.
  createMailingList()
    .then((result) => {
      console.log(result)
    })
    // Add users to mailing list.
    .then(() => {
      mg.lists(mailingList.address).members()
      .add({members: mgStatus.value, subscribed: true}, (err, body) => {
        if (err) return console.log(err)
        console.log(body)
      })
    })
    // Send message to mailing list.
    // .then(() => {
    //   mg.messages().send(messageData, (err, body) => {
    //     if (err) return console.log(err)
    //     console.log(body)
    //   })
    // })
    .catch(err => {
      console.log(err)
    })
}, sendDelay)

/**
 * Call generator with next
 * set interval
 * add recipient variable.
 * work on unsubscribe.
 * send at a later time in future
 *
 */



 //
 // const jobID = setInterval(() => {
 //   const status = memberSubset().next()
 //   members.length == 0 ? clearInterval(jobID) : null
 //   console.log(status.value)
 // }, 3000)

// console.log(memberSubset().next())
// console.log(memberSubset().next())

// const colors = ['red', 'orange', 'yellow', 'purple', 'brown'];
//
// const colors2 = colors.splice(0,3)
// console.log(colors2)
// console.log(colors)