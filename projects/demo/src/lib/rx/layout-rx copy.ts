import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable()
export class StyleManager {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  setStyle(key: string, href: string) {
    getLinkElementForKey(key, document).setAttribute('href', href);
  }

  removeStyle(key: string) {
    const existingLinkElement = getExistingLinkElementByKey(key, document);
    if (existingLinkElement) {
      document.head.removeChild(existingLinkElement);
    }
  }
}

function getLinkElementForKey(key: string, document: Document) {
  return (
    getExistingLinkElementByKey(key, document) ||
    createLinkElementWithKey(key, document)
  );
}

function getExistingLinkElementByKey(key: string, document: Document) {
  return document.head.querySelector(
    `link[rel="stylesheet"].${getClassNameForKey(key)}`
  );
}

function createLinkElementWithKey(key: string, document: Document) {
  const linkEl = document.createElement('link');
  linkEl.setAttribute('rel', 'stylesheet');
  linkEl.classList.add(getClassNameForKey(key));
  document.head.appendChild(linkEl);
  return linkEl;
}

function getClassNameForKey(key: string) {
  return `ww-theme-${key}`;
}
