/* eslint-env node, mocha */
require('chai').should()

var mrPair = require('./utils/run_server_client')
var mr = mrPair.client

describe('schema events', function () {
  this.timeout(3000)

  var fighterModel
  var fighterEntity

  before(function () {
    fighterModel = mr.model('fighter')
    // battleModel = mr.model('battle')
    return mr.authorize({nick: 'admin'})
  })

  describe('invoking listeners for events', function () {
    it('should invoke listener for create', function (done) {
      return fighterModel.on('create', function (doc) {
        doc.name.should.equal('Hound')
        fighterEntity = doc
        done()
      }).then(() => {
        fighterModel.create({name: 'Hound', health: 25, isNew: true}).then(function (created) {
          console.log('created the Hound')
        })
      })
    })

    it('should invoke listener for update', function (done) {
      fighterModel.on('update', (updatedDoc) => {
        console.log(arguments)
        console.log('arguments')
        updatedDoc.health.should.equal(0)
        done()
      })
      fighterEntity.health = 0
      fighterModel.update(fighterEntity)
    })

    it('should invoke listener for remove', function (done) {
      fighterModel.on('remove', (removed) => {
        removed.name.should.equal('Hound')
        done()
      }).then(() => {
        fighterModel.remove(fighterEntity)
      })
    })
  })

  after('it should be able to unsubscribe', function (done) {
    fighterModel.off('create').then(() => {
      fighterModel.off('update').then(() => {
        fighterModel.off('remove').then(() => {
          done()
        })
      })
    })
  })
})
