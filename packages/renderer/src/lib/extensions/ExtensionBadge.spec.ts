/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test } from 'vitest';

import ExtensionBadge from './ExtensionBadge.svelte';

type ExtensionType = { type: 'dd' | 'pd'; removable: boolean; devMode: boolean };

beforeEach(() => {});

test('Expect to have badge for dd Extension', async () => {
  const extension: ExtensionType = {
    type: 'dd',
    removable: true,
    devMode: false,
  };
  render(ExtensionBadge, { extension });
  // expect 'Docker Desktop extension' badge
  const labels = screen.getAllByText('Docker Desktop extension');

  // 2 items
  expect(labels).toHaveLength(2);
  expect(labels[0]).toBeInTheDocument();
  expect(labels[1]).toBeInTheDocument();
});

test('Expect to have badge for pd  built-in Extension', async () => {
  const extension: ExtensionType = {
    type: 'pd',
    removable: false,
    devMode: false,
  };
  render(ExtensionBadge, { extension });
  // expect 'built-in' badge
  const labels = screen.getAllByText('built-in Extension');

  // 2 items
  expect(labels).toHaveLength(2);
  expect(labels[0]).toBeInTheDocument();
  expect(labels[1]).toBeInTheDocument();
});

test('Expect to have badge for devMode Extension', async () => {
  const extension: ExtensionType = {
    type: 'pd',
    removable: false,
    devMode: true,
  };
  render(ExtensionBadge, { extension });
  // expect 'devMode' badge
  const labels = screen.getAllByText('In Development Mode Extension');

  // 2 items
  expect(labels).toHaveLength(1);
  expect(labels[0]).toBeInTheDocument();
});
