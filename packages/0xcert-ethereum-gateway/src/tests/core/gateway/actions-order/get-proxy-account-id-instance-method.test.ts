import { GenericProvider } from '@0xcert/ethereum-generic-provider';
import { Protocol } from '@0xcert/ethereum-sandbox';
import { Spec } from '@specron/spec';
import { ActionsGatewayProxy, Gateway } from '../../../..';

interface Data {
  protocol: Protocol;
  provider: GenericProvider;
}

const spec = new Spec<Data>();

spec.before(async (stage) => {
  const protocol = new Protocol(stage.web3);

  stage.set('protocol', await protocol.deploy());
});

spec.before(async (stage) => {
  const accounts = await stage.web3.eth.getAccounts();

  stage.set('coinbase', accounts[0]);
  stage.set('bob', accounts[1]);
  stage.set('sara', accounts[2]);
  stage.set('jane', accounts[3]);
});

spec.before(async (stage) => {
  const provider = new GenericProvider({
    client: stage.web3,
  });

  stage.set('provider', provider);
});

spec.test('returns proxy account address', async (ctx) => {
  const protocol = ctx.get('protocol');
  const provider = ctx.get('provider');
  const id = protocol.actionsGateway.instance.options.address;

  const gateway = new Gateway(provider, { actionsOrderId: id, assetLedgerDeployOrderId: '', valueLedgerDeployOrderId: '' });

  const tokenTransferProxy = await gateway.getProxyAccountId(ActionsGatewayProxy.TOKEN_TRANSFER);
  const nftokenTransferProxy = await gateway.getProxyAccountId(ActionsGatewayProxy.NFTOKEN_TRANSFER);
  const nftokenSafeTransferProxy = await gateway.getProxyAccountId(ActionsGatewayProxy.NFTOKEN_SAFE_TRANSFER);
  const xcertCreateProxy = await gateway.getProxyAccountId(ActionsGatewayProxy.XCERT_CREATE);

  ctx.is(tokenTransferProxy, protocol.tokenTransferProxy.instance.options.address);
  ctx.is(nftokenTransferProxy, protocol.nftokenTransferProxy.instance.options.address);
  ctx.is(nftokenSafeTransferProxy, protocol.nftokenSafeTransferProxy.instance.options.address);
  ctx.is(xcertCreateProxy, protocol.xcertCreateProxy.instance.options.address);
});

spec.test('returns null when calling getProxyAccountId on a contract that does not support it', async (ctx) => {
  const protocol = ctx.get('protocol');
  const provider = ctx.get('provider');
  const id = protocol.erc20.instance.options.address;

  const gateway = new Gateway(provider, { actionsOrderId: id, assetLedgerDeployOrderId: '', valueLedgerDeployOrderId: '' });

  const tokenTransferProxy = await gateway.getProxyAccountId(ActionsGatewayProxy.TOKEN_TRANSFER);
  ctx.is(tokenTransferProxy, null);
});

export default spec;
