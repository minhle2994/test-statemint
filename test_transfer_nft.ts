import { ApiPromise, WsProvider } from "@polkadot/api";
import { createTestPairs } from "@polkadot/keyring/testingPairs";
import { Keyring } from '@polkadot/keyring';

const test1Mnemonic = 'start print thing cart puppy virus crystal hire level bottom gap garbage'
const test2Mnemonic = 'nephew ten camera assist six apology fix shuffle keen century ugly sweet'
const classId = 29

const delay = (ms: number) => {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const parseTokenId = (tokenId: string) => {
    if (tokenId.includes(',')) return tokenId.replace(',', '');
    return tokenId;
}

async function main() {
  const wsProvider = new WsProvider('wss://westmint-rpc.polkadot.io/');
  const api = await ApiPromise.create({ 
    provider: wsProvider,
  });
  await api.isReadyOrError;

  const keyring = new Keyring({ type: 'sr25519'});
  const pair1 = keyring.addFromUri(test1Mnemonic, { name: 'test1' }, 'sr25519');
  const pair2 = keyring.addFromUri(test2Mnemonic, { name: 'test2' }, 'sr25519');

  console.log('test1 address:', pair1.address)
  // @ts-ignore
  let test1Assets = (await api.query.uniques.account.keys(pair1.address, classId));
  let test1AssetIds = []
  for (const key of test1Assets) {
    const data = key.toHuman() as string[];
    test1AssetIds.push({ classId: data[1], tokenId: parseTokenId(data[2]) });
  }
  console.log('test1 address nft:', test1AssetIds)

  // console.log('test2 address:', pair2.address)
  // @ts-ignore
  let test2Assets = (await api.query.uniques.account.keys(pair2.address, classId));
  let test2AssetIds = []
  for (const key of test2Assets) {
    const data = key.toHuman() as string[];
    test2AssetIds.push({ classId: data[1], tokenId: parseTokenId(data[2]) });
  }
  console.log('test2 address nft:', test2AssetIds)

  console.log('Sending NFT')
  const tokenId = test2AssetIds[0]['tokenId']
  const hash = await api.tx.uniques
    .transfer(
      classId,
      tokenId,
      pair1.address
    )
    .signAndSend(pair2);
  console.log("NFT sent with hash", hash.toHex());
  await delay(30000);

  // @ts-ignore
  test1Assets = (await api.query.uniques.account.keys(pair1.address, classId));
  test1AssetIds = []
  for (const key of test1Assets) {
    const data = key.toHuman() as string[];
    test1AssetIds.push({ classId: data[1], tokenId: parseTokenId(data[2]) });
  }
  console.log('test1 address nft:', test1AssetIds)

  // @ts-ignore
  test2Assets = (await api.query.uniques.account.keys(pair2.address, classId));
  test2AssetIds = []
  for (const key of test2Assets) {
    const data = key.toHuman() as string[];
    test2AssetIds.push({ classId: data[1], tokenId: parseTokenId(data[2]) });
  }
  console.log('test2 address nft:', test2AssetIds)
}


main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });