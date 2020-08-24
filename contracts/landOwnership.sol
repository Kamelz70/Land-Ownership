pragma solidity >=0.4.0 <0.6.0;

contract landOwnership{
    struct landDetails{
        string landAddress;
        string province;
        uint256 surveyNumber;
        address payable CurrentOwner;
        uint marketValue;
        bool isAvailable;
        address requester;
        reqStatus requestStatus;

    }
    enum reqStatus {Default,pending,rejected,approved}

    struct ownerAssets{
        uint[] listOfAssets;
        }


    mapping(uint => landDetails) land;
    address owner;
    mapping(string => address) admin;
    mapping(address => ownerAssets) ownersAssets;

    constructor() public{
        owner = msg.sender;
    }
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    //adding province admins
    function addAdmin(address _admin,string memory _province ) onlyOwner public {
        admin[_province]=_admin;
    }

    function Registration(string memory _landAddress,
        string memory _province,uint256 _surveyNumber,
        address payable _OwnerAddress,uint _marketValue,uint id
        ) public returns(bool) {
        require(admin[_province] == msg.sender || owner == msg.sender);
        land[id].landAddress = _landAddress;
        land[id].province = _province;
        land[id].surveyNumber = _surveyNumber;
        land[id].CurrentOwner = _OwnerAddress;
        land[id].marketValue = _marketValue;
        ownersAssets[_OwnerAddress].listOfAssets.push(id);
        return true;
    }
    function computeId(string memory _landAddress,string memory _province,uint _surveyNumber) public view returns(uint){
        return uint(keccak256(abi.encodePacked(_landAddress,_province,_surveyNumber)))%10000000000000;
    }

    function landInfoForOwner(uint id) public view returns(string memory,string memory,uint256,bool,address,reqStatus){
        return(land[id].landAddress,land[id].province,land[id].surveyNumber,land[id].isAvailable,land[id].requester,land[id].requestStatus);
    }

        function landInfoForBuyer(uint id) public view returns(address,uint,bool,address,reqStatus){
        return(land[id].CurrentOwner,land[id].marketValue,land[id].isAvailable,land[id].requester,land[id].requestStatus);
    }


    function requstToLandOwner(uint id) public {
        require(land[id].isAvailable);
        land[id].requester=msg.sender;
        land[id].isAvailable=false;
        land[id].requestStatus = reqStatus.pending; //changes the status to pending.
    }

    function viewAssets()public view returns(uint[] memory){
        return (ownersAssets[msg.sender].listOfAssets);
    }


    function viewRequest(uint property)public view returns(address){
        return(land[property].requester);
    }


    function processRequest(uint property,reqStatus status)public {
        require(land[property].CurrentOwner == msg.sender);
        land[property].requestStatus=status;
        if(status == reqStatus.rejected){
            land[property].requester = address(0);
            land[property].requestStatus = reqStatus.Default;
        }
    }

    function makeAvailable(uint property)public{
        require(land[property].CurrentOwner == msg.sender);
        land[property].isAvailable=true;
    }

    function buyProperty(uint property)public payable{
        require(land[property].requestStatus == reqStatus.approved);
        require(msg.value >= (land[property].marketValue+((land[property].marketValue)/10)));
        land[property].CurrentOwner.transfer(land[property].marketValue);
        removeOwnership(land[property].CurrentOwner,property);
        land[property].CurrentOwner=msg.sender;
        land[property].isAvailable=false;
        land[property].requester = address(0);
        land[property].requestStatus = reqStatus.Default;
        ownersAssets[msg.sender].listOfAssets.push(property); //adds the property to the asset list of the new owner.

    }
        function removeOwnership(address previousOwner,uint id)private{
        uint index = findId(id,previousOwner);
        ownersAssets[previousOwner].listOfAssets[index]=ownersAssets[previousOwner].listOfAssets[ownersAssets[previousOwner].listOfAssets.length-1];
        delete ownersAssets[previousOwner].listOfAssets[ownersAssets[previousOwner].listOfAssets.length-1];
        ownersAssets[previousOwner].listOfAssets.length--;
    }

    function findId(uint id,address user)public view returns(uint){
        uint i;
        for(i=0;i<ownersAssets[user].listOfAssets.length;i++){
            if(ownersAssets[user].listOfAssets[i] == id)
                return i;
        }
        return i;
    }
}
