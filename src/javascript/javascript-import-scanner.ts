/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import * as babel from 'babel-types';

import {ScannedImport} from '../model/model';
import {FileRelativeUrl} from '../model/url';

import {Visitor} from './estree-visitor';
import {JavaScriptDocument} from './javascript-document';
import {JavaScriptScanner} from './javascript-scanner';

export class JavaScriptImportScanner implements JavaScriptScanner {
  async scan(
      document: JavaScriptDocument,
      visit: (visitor: Visitor) => Promise<void>) {
    const imports: ScannedImport[] = [];

    await visit({
      enterImportDeclaration(node: babel.ImportDeclaration, _: babel.Node) {
        const source = node.source.value as FileRelativeUrl;
        if (!isPathImport(source)) {
          // TODO(justinfagnani): push a warning
          return;
        }
        imports.push(new ScannedImport(
            'js-import',
            ScannedImport.resolveUrl(document.url, source),
            document.sourceRangeForNode(node)!,
            document.sourceRangeForNode(node.source)!,
            node,
            false));
      }
    });
    return {features: imports, warnings: []};
  }
}

function isPathImport(source: string): boolean {
  return /^(\/|\.\/|\.\.\/)/.test(source);
}
