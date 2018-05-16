pragma solidity ^0.4.23;

library ClaimHolderLibrary {
  struct Claim {
      uint256 claimType;
      uint256 scheme;
      address issuer; // msg.sender
      bytes signature; // this.address + claimType + data
      bytes data;
      string uri;
  }

  struct Claims {
      mapping (bytes32 => Claim) byId;
      mapping (uint256 => bytes32[]) byType;
  }

  function add(
      Claims storage _claims,
      uint256 _claimType,
      uint256 _scheme,
      address _issuer,
      bytes _signature,
      bytes _data,
      string _uri
  )
      public
      returns (bytes32 claimRequestId)
  {
      bytes32 claimId = keccak256(_issuer, _claimType);

      if (_claims.byId[claimId].issuer != _issuer) {
          _claims.byType[_claimType].push(claimId);
      }

      _claims.byId[claimId].claimType = _claimType;
      _claims.byId[claimId].scheme = _scheme;
      _claims.byId[claimId].issuer = _issuer;
      _claims.byId[claimId].signature = _signature;
      _claims.byId[claimId].data = _data;
      _claims.byId[claimId].uri = _uri;

      return claimId;
  }

  function get(Claims storage _claims, bytes32 _claimId)
      public
      constant
      returns(
          uint256 claimType,
          uint256 scheme,
          address issuer,
          bytes signature,
          bytes data,
          string uri
      )
  {
      return (
          _claims.byId[_claimId].claimType,
          _claims.byId[_claimId].scheme,
          _claims.byId[_claimId].issuer,
          _claims.byId[_claimId].signature,
          _claims.byId[_claimId].data,
          _claims.byId[_claimId].uri
      );
  }

  function getBytes(bytes _str, uint256 _offset, uint256 _length)
      internal
      pure
      returns (bytes)
  {
      bytes memory sig = new bytes(_length);
      uint256 j = 0;
      for (uint256 k = _offset; k< _offset + _length; k++) {
        sig[j] = _str[k];
        j++;
      }
      return sig;
  }
}
