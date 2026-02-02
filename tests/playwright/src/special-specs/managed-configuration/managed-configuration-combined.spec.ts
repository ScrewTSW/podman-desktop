/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import { expect as playExpect } from '@playwright/test';

import { PreferencesPage } from '/@/model/pages/preferences-page';
import { RunnerOptions } from '/@/runner/runner-options';
import { test } from '/@/utility/fixtures';

// This combined spec validates managed configuration scenarios together as a smoke test
// Add more tests and assertions as the real combined spec is implemented

test.use({
  runnerOptions: new RunnerOptions({
    customFolder: 'managed-configuration',
    customSettings: {},
  }),
});

test.beforeAll(async ({ runner, welcomePage }) => {
  test.setTimeout(60_000);
  runner.setVideoAndTraceName('managed-configuration-combined-e2e');
  await welcomePage.handleWelcomePage(true);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe.serial('Managed Configuration - combined smoke', { tag: '@managed-configuration' }, () => {
  test('simple visibility and default values', async ({ navigationBar }) => {
    const settingsBar = await navigationBar.openSettings();
    const preferencesPage = await settingsBar.openTabPage(PreferencesPage);

    const appearanceRow = preferencesPage.getPreferenceRowByName(preferencesPage.APPEARANCE_PREFERENCE_LABEL);
    await playExpect(appearanceRow).toBeAttached();

    const isManaged = await preferencesPage.isPreferenceManaged(preferencesPage.APPEARANCE_PREFERENCE_LABEL);
    playExpect(typeof isManaged).toBe('boolean');

    const value = await preferencesPage.getAppearancePreferenceValue();
    playExpect(['system', 'light', 'dark']).toContain(value);
  });
});
