const LandOwnership = artifacts.require("landOwnership");


 //section for testing the registration part
contract("Land registration test", async accounts => {
  //testing that the creation of admin is happening correctly
    it("Adding superuser", async() => {
        let instance = await LandOwnership.deployed();
        let superUser = await instance.addAdmin(accounts[1],"Cairo",{from : accounts[0]});
        assert(superUser);
    });
  //checking that the authorized user can register the property successfully
    it("Registering land by an authorized super user", async() => {
      let instance = await LandOwnership.deployed();
      let superUser = await instance.addAdmin(accounts[1],"Cairo",{from : accounts[0]});
      let id = await instance.computeId.call('Triumph','Cairo',200);
      let register = await instance.Registration("Triumph","Cairo",200,accounts[2],20,id,{from : accounts[1]})
      assert(register);
  });
  //checking that error occours when try to register from an unautherized superuser if error then test is successful
  it("Expecting error while try to register from an  unautherized admin", async() => {
    let instance = await LandOwnership.deployed();
  //  let superUser = await instance.addSuperAdmin(accounts[1],"anakkayam",{from : accounts[0]});
    let id = await instance.computeId.call('Triumph','Cairo',200);
    let state;
    try{
      await instance.Registration("Triumph","Cairo",200,accounts[2],20,id,{from : accounts[2]});
      state = false;
    }
    catch(error){
    state = true;
    }
    assert(state);
});
});
// Here is testing the functions in land transation
contract("Land transaction test", async accounts => {
//Checking for a successful registration, expecting no error
  it("checking a successful registration", async() => {
      let instance = await LandOwnership.deployed();
      await instance.addAdmin(accounts[1],"Cairo",{from : accounts[0]});
      let id = await instance.computeId.call('Triumph','Cairo',200);
      await instance.Registration("Triumph","Cairo",200,accounts[2],web3.utils.toWei("20", 'ether'),id,{from : accounts[1]});
      let landInfo = await instance.landInfoForBuyer.call(id,{from : accounts[2]})
      assert.equal(landInfo[0],accounts[2])
  });
  // Checking the default value of availability, expecting false
  it("checking the availability for buying a land before make it avialable, by default it is unavailable", async() => {
    let instance = await LandOwnership.deployed();
    let id = await instance.computeId.call('Triumph','Cairo',200);
    let landInfo = await instance.landInfoForBuyer.call(id,{from : accounts[3]})
    assert.equal(landInfo[2],false);
});
//checking that the buyer can make request on a land before make it available expecting error
it("checking that the buyer can only make request if the property is available for sale", async() => {
  let instance = await LandOwnership.deployed();
  let id = await instance.computeId.call('Triumph','Cairo',200);
  let state;
  try{
  await instance.requstToLandOwner(id,{from : accounts[2]})
  state =false;
  }
  catch(error){
    state = true;
  }
  assert(state);
});
//checking that the make available function works by comparing the 'available' value to 'true' 
it("checking the availability for buying a land after make it avialable", async() => {
  let instance = await LandOwnership.deployed();
  let id = await instance.computeId.call('Triumph','Cairo',200);
  await instance.makeAvailable(id,{from : accounts[2]})
  let landInfo = await instance.landInfoForBuyer.call(id,{from : accounts[3]})
  assert.equal(landInfo[2],true);
});
//checking that buyer can make request after making property available, looking for requester address
// and it expected to be the requesters
it("checking that the request for land works!!", async() => {
  let instance = await LandOwnership.deployed();
  let id = await instance.computeId.call('Triumph','Cairo',200);
  await instance.requstToLandOwner(id,{from : accounts[3]})
  let landInfo = await instance.landInfoForBuyer.call(id,{from : accounts[3]})
  assert.equal(landInfo[3],accounts[3])
});
//checking that the buyer can buy the property before the request to be approved, expecting error
it("checking that the buyer can only buy, if the request is approved by the owner", async() => {
  let instance = await LandOwnership.deployed();
  let id = await instance.computeId.call('Triumph','Cairo',200);
  let state;
  try{
  await instance.buyProperty(id,{from : accounts[3], value :web3.utils.toWei("22", 'ether')})
  state =false;
  }
  catch(error){
    state = true;
  }
  assert(state);
});
//checking the request handling function working by looking the status of the request 
it("checking that the request approval works!!", async() => {
  let instance = await LandOwnership.deployed();
  let id = await instance.computeId.call('Triumph','Cairo',200);
  await instance.processRequest(id,3,{from : accounts[2]})
  let landInfo = await instance.landInfoForBuyer.call(id,{from : accounts[3]})
  assert.equal(landInfo[4],3)
});
//checking that there is a successful buy is happening, expecting that the current owner to be the buyer
it("checking that the buyer can buy the property and the ownership changes", async() => {
  let instance = await LandOwnership.deployed();
  let id = await instance.computeId.call('Triumph','Cairo',200);
  await instance.buyProperty(id,{from : accounts[3], value :web3.utils.toWei("22", 'ether')})
  let landInfo = await instance.landInfoForBuyer.call(id,{from : accounts[3]})
  assert.equal(landInfo[0],accounts[3])
});

});