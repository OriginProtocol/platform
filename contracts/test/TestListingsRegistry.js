const ListingsRegistry = artifacts.require("./ListingsRegistry.sol")
const OriginToken = artifacts.require("./OriginToken.sol")

const ipfsHash =
  "0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba"

// Used to assert error cases
const isEVMError = function(err) {
  let str = err.toString()
  return str.includes("revert")
}

contract("ListingsRegistry", accounts => {
  var owner = accounts[0]
  var notOwner = accounts[1]
  var listingsRegistry

  beforeEach(async function() {

    // ERC20 stuff
    // originToken = await originTokenlistingsRegistryContractDefinition.new({ from: owner })
    const originToken = await OriginToken.deployed()
    console.log(`originToken contract address: ${originToken.address}`)
    // send token to other user
    await originToken.transfer(notOwner, 1000, { from: owner })

    let newBalance = await originToken.balanceOf(notOwner)
    console.log(`newBalance: ${newBalance}`)

    listingsRegistry = await ListingsRegistry.deployed()
  })

  it("should have owner as owner of contract", async function() {
    let contractOwner = await listingsRegistry.owner()
    assert.equal(contractOwner, owner)
  })

/*
  it("should be able to create a listing", async function() {
    const initPrice = 2
    const initUnitsAvailable = 5
    let initialListingsLength = await listingsRegistry.listingsLength()
    console.log(`initialListingsLength: ${initialListingsLength+0}`)
    await listingsRegistry.create(ipfsHash, initPrice, initUnitsAvailable, {
      from: accounts[0]
    })
    let listingCount = await listingsRegistry.listingsLength()
    console.log(`listingCount: ${listingCount+0}`)
    assert.equal(
      listingCount + 0,
      initialListingsLength + 1,
      "listings count has incremented"
    )
    let [
      listingAddress,
      lister,
      hash,
      price,
      unitsAvailable
    ] = await listingsRegistry.getListing(initialListingsLength)
    assert.equal(lister, accounts[0], "lister is correct")
    assert.equal(hash, ipfsHash, "ipfsHash is correct")
    assert.equal(price, initPrice, "price is correct")
    assert.equal(
      unitsAvailable,
      initUnitsAvailable,
      "unitsAvailable is correct"
    )
  })
  */

})
