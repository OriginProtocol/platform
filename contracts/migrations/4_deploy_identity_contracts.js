var ClaimHolder = artifacts.require("./ClaimHolder.sol")
var ClaimHolderLibrary = artifacts.require("./ClaimHolderLibrary.sol")
var ClaimHolderPresigned = artifacts.require("./ClaimHolderPresigned.sol")
var KeyHolder = artifacts.require("./KeyHolder.sol")
var KeyHolderLibrary = artifacts.require("./KeyHolderLibrary.sol")
var UserRegistry = artifacts.require("./UserRegistry.sol")
var OriginIdentity = artifacts.require("./OriginIdentity.sol")

module.exports = function(deployer, network) {
  return deployer.then(() => {
    return deployContracts(deployer)
  })
}

async function deployContracts(deployer) {
  const accounts = await new Promise((resolve, reject) => {
    web3.eth.getAccounts((error, result) => {
      if (error) {
        reject(error)
      }
      resolve(result)
    })
  })

  const originIdentityOwner = accounts[0]

  await deployer.deploy(KeyHolderLibrary)
  await deployer.link(KeyHolderLibrary, KeyHolder)
  await deployer.link(KeyHolderLibrary, ClaimHolderLibrary)
  await deployer.deploy(ClaimHolderLibrary)

  await deployer.link(ClaimHolderLibrary, ClaimHolder)
  await deployer.link(KeyHolderLibrary, ClaimHolder)

  await deployer.link(ClaimHolderLibrary, ClaimHolderPresigned)
  await deployer.link(KeyHolderLibrary, ClaimHolderPresigned)

  await deployer.link(ClaimHolderLibrary, UserRegistry)
  await deployer.link(KeyHolderLibrary, UserRegistry)
  await deployer.deploy(UserRegistry)

  await deployer.link(ClaimHolderLibrary, OriginIdentity)
  await deployer.link(KeyHolderLibrary, OriginIdentity)
  await deployer.deploy(OriginIdentity, originIdentityOwner)
}