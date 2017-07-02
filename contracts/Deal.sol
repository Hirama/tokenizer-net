pragma solidity ^0.4.11;

contract Deal{

    address public renter;
    address public landlord;
    address public tokenizedDeal;
    uint public amountOfPaymentNeed;
    uint public amountOfPaymentDid;
    uint public paymentTimeStamp;
    uint public checkIn;
    uint public nights;
    mapping (address => uint) balances;
    DealStatus public status;

    // Events
    event PaymentInfoTo(string text, address landlord, uint amount);
    event PaymentInfoFrom(string text, address renter, uint amount);

    // Modifiers
    modifier onlyLandlord {
        require(msg.sender == landlord);
        _;
    }

    enum DealStatus{
        Open,
        InProgress,
        Suspended,
        Closed
    }

    function Deal(address _landlord, uint _amount, uint _checkIn, uint _nights) {
        landlord = _landlord;
        amountOfPaymentNeed = _amount;
        checkIn = _checkIn;
        nights = _nights;
        tokenizedDeal = msg.sender;
        status = DealStatus.Open;
    }

    function() payable {
        sendDeposit();
    }

    function sendDeposit() payable {
        if (msg.value < amountOfPaymentNeed) throw;
        if (DealStatus.Open == status ) {
            renter = msg.sender;
            status = DealStatus.InProgress;
            amountOfPaymentDid = msg.value;
            paymentTimeStamp = block.timestamp;
            PaymentInfoFrom("Diposit accepted from ",msg.sender, this.balance);
        }
    }

    // Update status and withdraw founds to the lordland
    function withdraw() public {
        if (DealStatus.InProgress != status) throw;
        if (now - checkIn >= nights) {
            PaymentInfoTo("Diposit was sended to ", landlord, this.balance);
            landlord.transfer(this.balance);
            status = DealStatus.Closed;
        }
    }

    /**
    * @dev Fix for the ERC20 short address attack.
    */
      modifier onlyPayloadSize(uint size) {
         if(msg.data.length < size + 4) {
           throw;
         }
         _;
      }
}
