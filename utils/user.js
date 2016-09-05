const fs = require('fs')
const faker = require('faker')
const mailgun = require('mailgun-js')
const config = require('./config.json')

const domain = config.domain
const apiKey = config.apiKey
const batchSize = config.batchSize
const mailingList = config.mailingList
const messageData = config.messageData
messageData.to = mailingList.address

console.log(messageData)

const mg = mailgun({apiKey, domain})

// string.replace method fixes issues in windows.
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
    members.length % batchSize <= 1 ? yield members.splice(0, batchSize) : null
  }
}

const createMailingList = () => {
  return new Promise((resolve, reject) => {
    mg.lists().create(mailingList, (err, body) => {
      if (err) return reject(err)
      return resolve(body)
    })
  })
}

createMailingList()
  .then((result) => {
    console.log(result)
  })
  .then(() => {
    // Add users to mailing list.
    mg.lists(mailingList.address).members().add({members, subscribed: true}, (err, body) => {
      if (err) return console.log(err)
      console.log(body)
    })
  })
  // .then(() => {
  //   // Delete mailing List.
  //   mg.lists(mailingList.address).delete((err, body) => {
  //     if (err) return console.log(err)
  //     console.log(body)
  //   })
  // })
  .catch(err => {
    console.log(err)
  })



// Add members to mailing list.




// send message to mailing list.


// Delete mailing list.
// mg.lists(mailingList.address).delete((err, body) => {
//   if (err) return console.log(err)
//   console.log(body)
// })

//
// console.log(memberSubset().next().value)
// console.log(memberSubset().next())
// console.log(memberSubset().next())

// const colors = ['red', 'orange', 'yellow', 'purple', 'brown'];
//
// const colors2 = colors.splice(0,3)
// console.log(colors2)
// console.log(colors)