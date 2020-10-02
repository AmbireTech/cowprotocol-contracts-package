import { utils, Wallet, Contract, BigNumber } from "ethers";

export const DOMAIN_SEPARATOR =
  "0x24a654ed47680d6a76f087ec92b3a0f0fe4c9c82c26bff3bb22dffe0f120c7f0";

export declare type SmartContractOrder = {
  sellAmount: BigNumber;
  buyAmount: BigNumber;
  sellToken: string;
  buyToken: string;
  owner: string;
  validFrom: BigNumber;
  validUntil: BigNumber;
  nonce: BigNumber;
};
export class Order {
  sellAmount: BigNumber;
  buyAmount: BigNumber;
  sellToken: Contract;
  buyToken: Contract;
  wallet: Wallet;
  validFrom: BigNumber;
  validUntil: BigNumber;
  nonce: BigNumber;

  constructor(
    sellAmount: BigNumber | number,
    buyAmount: BigNumber | number,
    sellToken: Contract,
    buyToken: Contract,
    wallet: Wallet,
    validFrom: BigNumber | number,
    validUntil: BigNumber | number,
    nonce: BigNumber | number,
  ) {
    this.sellAmount = BigNumber.from(sellAmount);
    this.buyAmount = BigNumber.from(buyAmount);
    this.sellToken = sellToken;
    this.buyToken = buyToken;
    this.wallet = wallet;
    this.validFrom = BigNumber.from(validFrom);
    this.validUntil = BigNumber.from(validUntil);
    this.nonce = BigNumber.from(nonce);
  }

  encode(): Buffer {
    const digest = this.getOrderDigest();
    const signature = this.wallet._signingKey().signDigest(digest);
    const { v, r, s } = utils.splitSignature(signature);
    const encodedOrder = utils.defaultAbiCoder.encode(
      [
        "uint256",
        "uint256",
        "address",
        "address",
        "address",
        "uint32",
        "uint32",
        "uint8",
        "uint8",
        "bytes32",
        "bytes32",
      ],
      [
        this.sellAmount.toString(),
        this.buyAmount.toString(),
        this.sellToken.address,
        this.buyToken.address,
        this.wallet.address,
        this.validFrom.toString(),
        this.validUntil.toString(),
        this.nonce.toString(),
        v,
        r,
        s,
      ],
    );
    return Buffer.from(encodedOrder.substr(2), "hex");
  }

  getSmartContractOrder(): SmartContractOrder {
    return {
      sellAmount: this.sellAmount,
      buyAmount: this.buyAmount,
      sellToken: this.sellToken.address,
      buyToken: this.buyToken.address,
      owner: this.wallet.address,
      validFrom: this.validFrom,
      validUntil: this.validUntil,
      nonce: this.nonce,
    };
  }

  getOrderDigest(): string {
    return utils.keccak256(
      utils.defaultAbiCoder.encode(
        [
          "bytes32",
          "uint256",
          "uint256",
          "address",
          "address",
          "address",
          "uint32",
          "uint32",
          "uint8",
        ],
        [
          DOMAIN_SEPARATOR,
          this.sellAmount.toString(),
          this.buyAmount.toString(),
          this.sellToken.address,
          this.buyToken.address,
          this.wallet.address,
          this.validFrom.toString(),
          this.validUntil.toString(),
          this.nonce.toString(),
        ],
      ),
    );
  }

  clone(): Order {
    return new Order(
      this.sellAmount,
      this.buyAmount,
      this.sellToken,
      this.buyToken,
      this.wallet,
      this.validFrom,
      this.validUntil,
      this.nonce,
    );
  }
}
