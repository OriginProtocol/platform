const { assertJump } = require('../openzeppelin-token/helpers/assertJump');
import assertRevert from '../openzeppelin-token/helpers/assertRevert'
import { EISCONN } from 'constants';
const EternalStorage = artifacts.require('EternalStorage')

const BigNumber = web3.BigNumber
require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

contract('EternalStorage', function(accounts) {
  const admin = accounts[0]
  const initialAdmins = 1
  const initialWriters = 0
  let es

  beforeEach(async function() {
    es = await EternalStorage.new()
  })

  describe('security', async function() {
    it('starts with one admin and no writers', async function() {
      assert.isTrue(await es.isAdmin(admin))
      assert.equal(await es.adminCount(), initialAdmins)
      assert.equal(await es.writerCount(), initialWriters)
    })

    it('allows admins to add new admins', async function() {
      const newAdmin = accounts[1]
      await es.addAdmin(newAdmin)
      assert.isTrue(await es.isAdmin(admin))
      assert.isTrue(await es.isAdmin(newAdmin))
      assert.equal(await es.adminCount(), initialAdmins + 1)
      assert.equal(await es.writerCount(), initialWriters)
    })

    it('allows a new admin to remove an existing admin', async function() {
      const newAdmin = accounts[1]
      await es.addAdmin(newAdmin)
      assert.isTrue(await es.isAdmin(newAdmin))
      await es.removeAdmin(admin, {from: newAdmin})
      assert.isFalse(await es.isAdmin(admin))
      assert.equal(await es.adminCount(), initialAdmins)
      assert.equal(await es.writerCount(), initialWriters)
    })

    it('allows admins to add and remove writers', async function() {
      const newWriter = accounts[1]
      await es.addWriter(newWriter)
      assert.equal(await es.adminCount(), initialAdmins)
      assert.equal(await es.writerCount(), initialWriters + 1)
      assert.isTrue(await es.isWriter(newWriter))
      await es.removeWriter(newWriter)
      assert.equal(await es.adminCount(), initialAdmins)
      assert.equal(await es.writerCount(), initialWriters)
      assert.isFalse(await es.isWriter(newWriter))
    })

    it('does not allow writers to add admins or writers', async function() {
      const writer = accounts[1]
      const other = accounts[2]
      await es.addWriter(writer)
      assert.equal(await es.adminCount(), initialAdmins)
      assert.equal(await es.writerCount(), initialWriters + 1)
      await assertRevert(es.addWriter(other, {from: writer}))
      await assertRevert(es.addAdmin(other, {from: writer}))
      assert.equal(await es.adminCount(), initialAdmins)
      assert.equal(await es.writerCount(), initialWriters + 1)
    })

    it('does not decrement adminCount when removing non-admin address', async function() {
      const other = accounts[1]
      await es.removeAdmin(other)
      assert.equal(await es.adminCount(), initialAdmins)
      assert.equal(await es.writerCount(), initialWriters)
    })

    it('does not decrement writerCount when removing non-writer address', async function() {
      const other = accounts[1]
      await es.removeWriter(other)
      assert.equal(await es.adminCount(), initialAdmins)
      assert.equal(await es.writerCount(), initialWriters)
    })

    it('does not allow removal of final owner', async function() {
      assertRevert(es.removeAdmin(admin))
    })

    // TODO: ensure admins and writers can perform every operation
    // TODO: ensure non-writers can't write
  })

  // TODO: test incrementers
  // TODO: test getters
  // TODO: test setters
  // TODO: test deleters
  const key = '0x407D73d8a49eeb85D32Cf465507dd71d507100c1'

  it('addresses can be set, get, and deleted', async function() {
    const value =     '0x627306090abab3a6e1400e9345bc60c78a8bef57'
    const zeroValue = '0x0000000000000000000000000000000000000000'

    await es.setAddress(key, value)

    const getValue = await es.getAddress(key)
    assert.equal(getValue, value)

    await es.deleteAddress(key)
    const deletedValue = await es.getAddress(key)
    assert.equal(deletedValue, zeroValue)
  })

  describe('uints', async function() {
    const value = 42
    const zeroValue = 0

    it('can be set, get, and deleted', async function() {
      await es.setUint(key, value)

      const getValue = await es.getUint(key)
      assert.equal(getValue, value)

      await es.deleteUint(key)
      const deletedValue = await es.getUint(key)
      assert.equal(deletedValue, zeroValue)
    })

    it('can be incremented', async function() {
      await es.setUint(key, value)
      const getValue = await es.getUint(key)
      assert.equal(getValue, value)
      await es.incrementUint(key, 1)
      const incrValue = await es.getUint(key)
      assert.equal(incrValue, value + 1)
    })

    it('can be decremented', async function() {
      await es.setUint(key, value)
      const getValue = await es.getUint(key)
      assert.equal(getValue, value)
      await es.decrementUint(key, 1)
      const incrValue = await es.getUint(key)
      assert.equal(incrValue, value - 1)
    })

    it('increment reverts on overflow', async function() {
      const uint256Max =
        new BigNumber('115792089237316195423570985008687907853269984665640564039457584007913129639935')
      await es.setUint(key, uint256Max)
      const getValue = await es.getUint(key)
      getValue.should.be.bignumber.equal(uint256Max)
      await assertJump(es.incrementUint(key, 1))
    })

    it('decrement reverts on underflow', async function() {
      await es.setUint(key, 0)
      const getValue = await es.getUint(key)
      getValue.should.be.bignumber.equal(0)
      await assertJump(es.decrementUint(key, 1))
    })
  })
})
