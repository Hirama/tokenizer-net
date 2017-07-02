pragma solidity ^0.4.11;

import "ERC20Basic.sol";
import 'SafeMath.sol';
import "Deal.sol";

contract TokenizedDeal is ERC20Basic {

  using SafeMath for uint;

  mapping(address => uint) balances;

  address public landlord;
  uint    public amountOfPayment;
  uint    public nights;
  uint public tokenPrice;
  uint    public constant decimals = 18;
  uint public initialSupply = 1000;


  modifier onlyLandlord() {
    if (msg.sender != landlord) {
      throw;
    }
    _;
  }

  event DealAddress(string , address dealAddress);

  function TokenizedDeal(address _landlord, uint _amountOfPayment, uint _nights, uint _tokenPrice) {
      landlord = _landlord;
      amountOfPayment = _amountOfPayment;
      nights = _nights;
      tokenPrice = _tokenPrice;
      balances[_landlord] = balances[_landlord].add(initialSupply - 490);
  }

  function() payable {
      createTokens(msg.sender);
  }

  /**
    * @dev Creates tokens and send to the specified address.
    * @param recipient The address which will recieve the new tokens.
  */
  function createTokens(address recipient) payable {
    if (msg.value == 0) {
      throw;
    }

    uint tokens = msg.value.mul(getPrice());
    totalSupply = totalSupply.add(tokens);

    balances[recipient] = balances[recipient].add(tokens);
  }


  /**
   * @dev replace this with any other price function
   * @return The price per unit of token.
   */
  function getPrice() constant returns (uint result) {
    return tokenPrice;
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

  /**
    * @dev transfer token for a specified address
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint _value) onlyPayloadSize(2 * 32) {
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) constant returns (uint balance) {
    return balances[_owner];
  }

  /**
   * @dev Create contract deal if landlorad accept ofer from renter
  */
  function createDeal(uint _checkIn) returns (address dealAddress) {
     address deal = new Deal(landlord, amountOfPayment, _checkIn, nights);
     DealAddress("Deal address", deal);
     return deal;
  }

}
