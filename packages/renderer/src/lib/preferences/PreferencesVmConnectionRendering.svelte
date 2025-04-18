<script lang="ts">
import { Tab } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import { handleNavigation } from '/@/navigation';
import Route from '/@/Route.svelte';
import { NavigationPage } from '/@api/navigation-page';
import type { ProviderContainerConnectionInfo, ProviderInfo, ProviderVmConnectionInfo } from '/@api/provider-info';

import { providerInfos } from '../../stores/providers';
import IconImage from '../appearance/IconImage.svelte';
import ConnectionErrorInfoButton from '../ui/ConnectionErrorInfoButton.svelte';
import ConnectionStatus from '../ui/ConnectionStatus.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import { getTabUrl, isTabSelected } from '../ui/Util';
import { eventCollect } from './preferences-connection-rendering-task';
import PreferencesConnectionActions from './PreferencesConnectionActions.svelte';
import PreferencesConnectionDetailsTerminal from './PreferencesConnectionDetailsTerminal.svelte';
import type { IConnectionRestart, IConnectionStatus } from './Util';
import { getProviderConnectionName } from './Util';

export let providerInternalId: string | undefined = undefined;
export let connectionName = '';

let connectionStatus: IConnectionStatus;
let connectionInfo: ProviderVmConnectionInfo | undefined;
let providerInfo: ProviderInfo | undefined;
let loggerHandlerKey: symbol | undefined;

let providersUnsubscribe: Unsubscriber;
onMount(async () => {
  providersUnsubscribe = providerInfos.subscribe(providerInfosValue => {
    const providers = providerInfosValue;
    providerInfo = providers.find(provider => provider.internalId === providerInternalId);

    connectionInfo = providerInfo?.vmConnections?.find(connection => connection.name === connectionName);
    if (!connectionInfo) {
      handleNavigation({
        page: NavigationPage.RESOURCES,
      });
      return;
    }
    if (!providerInfo) {
      return;
    }
    const vmConnectionName = getProviderConnectionName(providerInfo, connectionInfo);
    if (vmConnectionName && (!connectionStatus || connectionStatus.status !== connectionInfo.status)) {
      if (loggerHandlerKey !== undefined) {
        connectionStatus = {
          inProgress: true,
          action: 'restart',
          status: connectionInfo.status,
        };
        startConnectionProvider(providerInfo, connectionInfo, loggerHandlerKey).catch((err: unknown) =>
          console.error(`Error starting provider ${connectionInfo?.name}`, err),
        );
        loggerHandlerKey = undefined;
      } else {
        connectionStatus = {
          inProgress: false,
          action: undefined,
          status: connectionInfo.status,
        };
      }
    }
    connectionStatus = connectionStatus;
  });
});

onDestroy(() => {
  if (providersUnsubscribe) {
    providersUnsubscribe();
  }
});

async function startConnectionProvider(
  provider: ProviderInfo,
  connectionInfo: ProviderVmConnectionInfo,
  loggerHandlerKey: symbol,
): Promise<void> {
  await window.startProviderConnectionLifecycle(provider.internalId, connectionInfo, loggerHandlerKey, eventCollect);
}

function updateConnectionStatus(
  provider: ProviderInfo,
  connectionInfo: ProviderVmConnectionInfo | ProviderContainerConnectionInfo,
  action?: string,
  error?: string,
): void {
  if (error) {
    if (connectionStatus) {
      connectionStatus = {
        ...connectionStatus,
        inProgress: false,
        error,
      };
    }
  } else if (action) {
    connectionStatus = {
      inProgress: true,
      action: action,
      status: connectionInfo.status,
    };
  }
  connectionStatus = connectionStatus;
}

function addConnectionToRestartingQueue(connection: IConnectionRestart): void {
  loggerHandlerKey = connection.loggerHandlerKey;
}
</script>

{#if connectionInfo}
  <DetailsPage title={connectionInfo.name}>
    {#snippet subtitleSnippet()}
      {#if connectionInfo}
        <div class="flex flex-row">
          <ConnectionStatus status={connectionInfo.status} />
          <ConnectionErrorInfoButton status={connectionStatus} />
        </div>
      {/if}
    {/snippet}
    {#snippet actionsSnippet()}
      {#if providerInfo && connectionInfo}
        <div class="flex justify-end">
          <PreferencesConnectionActions
            provider={providerInfo}
            connection={connectionInfo}
            connectionStatus={connectionStatus}
            updateConnectionStatus={updateConnectionStatus}
            addConnectionToRestartingQueue={addConnectionToRestartingQueue} />
        </div>
      {/if}
    {/snippet}
    {#snippet iconSnippet()}
      <IconImage image={providerInfo?.images?.icon} alt={providerInfo?.name} class="max-h-10" />
    {/snippet}
    {#snippet tabsSnippet()}
      <Tab
        title="Terminal"
        selected={isTabSelected($router.path, 'terminal')}
        url={getTabUrl($router.path, 'terminal')} />
    {/snippet}
    {#snippet contentSnippet()}
      <div class="h-full">
        {#if providerInfo && connectionInfo}
          <Route path="/terminal" breadcrumb="Terminal" navigationHint="tab">
            <PreferencesConnectionDetailsTerminal
              provider={providerInfo}
              connectionInfo={connectionInfo}
              screenReaderMode={true} />
          </Route>
        {/if}
      </div>
    {/snippet}
  </DetailsPage>
{/if}
