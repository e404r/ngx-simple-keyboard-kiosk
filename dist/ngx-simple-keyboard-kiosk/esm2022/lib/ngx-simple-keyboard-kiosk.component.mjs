import { Component, ViewChild, Input, Output, EventEmitter, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import Keyboard from 'simple-keyboard';
import SimpleKeyboardLayouts from "simple-keyboard-layouts";
import englishLayout from "simple-keyboard-layouts/build/layouts/english";
import georgianlayout from "simple-keyboard-layouts/build/layouts/georgian";
import * as i0 from "@angular/core";
import * as i1 from "./country.service";
export class NgxSimpleKeyboardKioskComponent {
    constructor(renderer, flags, document) {
        this.renderer = renderer;
        this.flags = flags;
        this.document = document;
        this.languageChange = new EventEmitter();
        this.inputElement = null;
        this.shiftPressed = false;
        this.isMouseDown = false;
        this.languageLayout = englishLayout;
        this.languageLayouts = englishLayout;
        this.keyboardHideTask = null;
        this.numericLayout = {
            default: ['1 2 3', '4 5 6', '7 8 9', '{tab} 0 {bksp} {downkeyboard}'],
        };
        this.querySelector = 'input:not([readonly]), textarea:not([readonly])';
    }
    ngOnInit() {
        this.originalDefaultLanguage = this.defaultLanguage; // Store the original default language
        this.setupKeyboard();
        this.setupEventListeners();
        this.keyboardContainer.nativeElement.style.display = 'none'; // Initially hide the keyboard
    }
    setupKeyboard() {
        // Initialize available layouts
        let layoutsInstance = new SimpleKeyboardLayouts();
        this.languageLayouts = layoutsInstance.layouts;
        // Automatically set language layout based on the provided languages
        this.languageLayout = this.languageLayouts[this.defaultLanguage]
            || this.languageLayouts['english']; // Fallback to English if not found
        if (this.secondLanguage === 'english') {
            this.flagUrl = this.flags.getFlag('english');
        }
        else {
            this.flagUrl = this.flags.getFlag(this.secondLanguage);
        }
        const keyRowsDefault = this.languageLayout.layout.default;
        //keyRowsDefault[keyRowsDefault.length - 1] += ' {downkeyboard} {lang}';
        // keyRowsDefault[keyRowsDefault.length - 1] += ' {downkeyboard} {lang}';
        let lastRow = keyRowsDefault[keyRowsDefault.length - 1];
        lastRow = lastRow.replace('{space}', '{lang} {space} {downkeyboard}');
        keyRowsDefault[keyRowsDefault.length - 1] = lastRow;
        const keyRowsShift = this.languageLayout.layout.shift;
        // keyRowsShift[keyRowsShift.length - 1] += ' {downkeyboard}';
        // keyRowsShift[keyRowsShift.length - 1] += ' {downkeyboard} {lang}';
        keyRowsShift[keyRowsShift.length - 1] = lastRow;
        const removeKeys = (row, keysToRemove) => {
            return row.split(' ').filter(key => !keysToRemove.includes(key)).join(' ');
        };
        if (this.removeks && this.removeks.length > 0) {
            if (keyRowsDefault.length > 0) {
                keyRowsDefault.forEach((row, index) => {
                    keyRowsDefault[index] = removeKeys(row, this.removeks);
                });
            }
            if (keyRowsShift.length > 0) {
                keyRowsShift.forEach((row, index) => {
                    keyRowsShift[index] = removeKeys(row, this.removeks);
                });
            }
        }
        this.keyboard = new Keyboard({
            onChange: (input) => this.onChange(input),
            onKeyPress: (button) => this.onKeyPress(button),
            onKeyReleased: (button) => this.onKeyRelease(button),
            ...this.languageLayout,
            display: {
                '{tab}': '↹',
                '{bksp}': '⌫',
                '{downkeyboard}': '<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"> <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" clip-rule="evenodd"/> </svg>',
                '{space}': ' ',
                '{lang}': `${this.flagUrl}`,
                '{lock}': '⇪',
                '{shift}': '⇧',
                '{enter}': '↵',
            },
        });
        this.hideKeyboard();
    }
    setupEventListeners() {
        this.renderer.listen('window', 'focusin', (event) => {
            const target = event.target;
            if (target && target.matches(this.querySelector)) {
                this.onFocus(target);
            }
        });
        const events = ['mousedown', 'mouseup', 'touchstart', 'touchend'];
        events.forEach(eventName => {
            this.renderer.listen('body', eventName, (event) => {
                if (eventName === 'mouseup') {
                    this.onMouseUp(event);
                }
                if (this.isChildElement(event.target, this.keyboardContainer.nativeElement)) {
                    event.preventDefault(); // Prevents input blur when interacting with the keyboard
                }
            });
        });
    }
    setupEventListenersOLD() {
        this.renderer.listen('window', 'focusin', (event) => {
            const target = event.target;
            if (target && target.matches(this.querySelector)) {
                this.onFocus(target);
            }
        });
        const events = ['mousedown', 'mouseup', 'touchstart', 'touchend'];
        events.forEach(eventName => {
            this.renderer.listen('body', eventName, (event) => {
                if (this.isChildElement(event.target, this.keyboardContainer.nativeElement)) {
                    event.preventDefault(); // Prevents input blur when interacting with the keyboard
                }
            });
        });
    }
    updateKeyboardLayout() {
        const layout = this.defaultLanguage === 'english' ? englishLayout : georgianlayout;
        this.switchLanguage('english');
    }
    switchLanguage(language) {
        const layoutsInstance = new SimpleKeyboardLayouts();
        this.languageLayouts = layoutsInstance.layouts;
        this.languageLayout = this.languageLayouts[language] || this.languageLayouts['english'];
        if (language === this.originalDefaultLanguage) {
            this.flagUrl = this.flags.getFlag(this.secondLanguage);
        }
        else {
            this.flagUrl = this.flags.getFlag(this.originalDefaultLanguage);
        }
        const keyRowsDefault = this.languageLayout.layout.default;
        const keyRowsShift = this.languageLayout.layout.shift;
        const removeKeys = (row, keysToRemove) => {
            return row.split(' ').filter(key => !keysToRemove.includes(key)).join(' ');
        };
        if (this.removeks && this.removeks.length > 0) {
            if (keyRowsDefault.length > 0) {
                keyRowsDefault.forEach((row, index) => {
                    keyRowsDefault[index] = removeKeys(row, this.removeks);
                });
            }
            if (keyRowsShift.length > 0) {
                keyRowsShift.forEach((row, index) => {
                    keyRowsShift[index] = removeKeys(row, this.removeks);
                });
            }
        }
        const addSpecialButtons = (row) => {
            if (row.includes('{space}') && !row.includes('{lang}') && !row.includes('{downkeyboard}')) {
                row = row.replace('{space}', '{lang} {space} {downkeyboard}');
            }
            return row;
        };
        if (keyRowsDefault.length > 0) {
            keyRowsDefault[keyRowsDefault.length - 1] = addSpecialButtons(keyRowsDefault[keyRowsDefault.length - 1]);
        }
        if (keyRowsShift.length > 0) {
            keyRowsShift[keyRowsShift.length - 1] = addSpecialButtons(keyRowsShift[keyRowsShift.length - 1]);
        }
        // Set the options on the keyboard
        if (this.keyboard) {
            this.keyboard.setOptions({
                ...this.languageLayout,
                layoutName: 'default',
                display: {
                    '{tab}': '↹',
                    '{bksp}': '⌫',
                    '{downkeyboard}': '<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"> <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" clip-rule="evenodd"/> </svg>',
                    '{space}': ' ',
                    '{lang}': `${this.flagUrl}`,
                    '{lock}': '⇪',
                    '{shift}': '⇧',
                    '{enter}': '↵',
                }
            });
        }
        // Emit the language change
        this.languageChange.emit(language);
    }
    switchLanguageold(language) {
        this.languageLayout = this.defaultLanguage === 'english' ? englishLayout : georgianlayout;
        const keyRowsDefault = this.languageLayout.layout.default;
        keyRowsDefault[keyRowsDefault.length - 1] += ' {downkeyboard}';
        keyRowsDefault[keyRowsDefault.length - 1] += ' {lang}';
        const keyRowsShift = this.languageLayout.layout.shift;
        keyRowsShift[keyRowsShift.length - 1] += ' {downkeyboard}';
        if (this.keyboard) {
            this.keyboard.setOptions({
                ...this.languageLayout,
                display: {
                    '{tab}': '↹',
                    '{bksp}': '⌫',
                    '{downkeyboard}': '<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"> <path fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z" clip-rule="evenodd"/> </svg>',
                    '{space}': ' ',
                    '{lang}': "LANG",
                    '{lock}': '⇪',
                    '{shift}': '⇧',
                    '{enter}': '↵',
                },
                layoutName: 'default',
            });
            this.toggleShiftLayout();
            this.toggleShiftLayout();
        }
    }
    isChildElement(child, target) {
        if (target === child) {
            return true;
        }
        if (child.parentElement) {
            return this.isChildElement(child.parentElement, target);
        }
        return false;
    }
    onChange(input) {
        // Handle input change if needed
    }
    onKeyPress(button) {
        if (!this.inputElement || !button) {
            return;
        }
        const pos = this.inputElement.selectionStart;
        const posEnd = this.inputElement.selectionEnd;
        if (this.inputElement.type.toLowerCase() === 'number' && button !== '{tab}' && button !== '{downkeyboard}') {
            this.onKeyPressNumeric(button);
            return;
        }
        switch (button) {
            case '{shift}':
                this.handleShiftPress();
                break;
            case '{lock}':
                this.handleCapsLockPressed();
                break;
            case '{enter}':
                this.handleEnterPress(pos, posEnd);
                break;
            case '{bksp}':
                this.handleBackspacePress(pos, posEnd);
                break;
            case '{tab}':
                this.handleTabPress();
                break;
            case '{downkeyboard}':
                break;
            case '{space}':
                this.handleSpacePress(pos, posEnd);
                break;
            case '{lang}':
                this.handleLangswitch();
                break;
            default:
                this.handleDefaultKeyPress(button, pos, posEnd);
                break;
        }
        if (button !== '{shift}') {
            this.disableShiftPress();
        }
    }
    onKeyRelease(button) {
        if (button === '{downkeyboard}') {
            this.onFocusOut();
        }
    }
    onMouseUp(event) {
        this.isMouseDown = false;
        if (!this.inputElement || !this.inputElement.contains(event.target) || !this.keyboardContainer) {
            // this.hideKeyboard();
            // this.hideKeyboardToggler();
        }
    }
    onMouseUpNew(event) {
        this.isMouseDown = false;
        // Access native elements from ElementRef
        const inputElementNative = this.inputElement;
        const keyboardContainerNative = this.keyboardContainer ? this.keyboardContainer.nativeElement : null;
        // Check if the click was outside both inputElement and keyboardContainer
        if (!inputElementNative || !inputElementNative.contains(event.target)) {
            if (!keyboardContainerNative || !keyboardContainerNative.contains(event.target)) {
                //this.hideKeyboard();
                // this.hideKeyboardToggler();
            }
        }
    }
    onKeyPressNumeric(button) {
        if (![0, 1, 2, 3, 4, 5, 6, 7, 8, 9, '{bksp}'].some(x => String(x) === button)) {
            return;
        }
        if (button === '{bksp}') {
            const strValue = String(this.inputElement.value);
            if (strValue.length > 0) {
                this.inputElement.value = strValue.substring(0, strValue.length - 1);
            }
        }
        else {
            this.inputElement.value += button;
        }
        this.performNativeKeyPress(this.inputElement, button.charCodeAt(0));
    }
    handleEnterPress(pos, posEnd) {
        if (this.inputElement.tagName.toLowerCase() === 'textarea') {
            const button = '\n';
            if (pos !== null && posEnd !== null) {
                this.inputElement.value =
                    this.inputElement.value.substr(0, pos) +
                        button +
                        this.inputElement.value.substr(posEnd);
                this.inputElement.selectionStart = pos + 1;
                this.inputElement.selectionEnd = pos + 1;
            }
            else {
                this.inputElement.value += button;
            }
        }
        this.performNativeKeyPress(this.inputElement, 13);
    }
    handleLangswitch() {
        this.defaultLanguage = this.defaultLanguage === this.secondLanguage
            ? this.originalDefaultLanguage
            : this.secondLanguage;
        this.switchLanguage(this.defaultLanguage);
    }
    handleBackspacePress(pos, posEnd) {
        if (!this.inputElement || pos === null || posEnd === null)
            return;
        const value = this.inputElement.value;
        if (pos === posEnd) {
            // If there's no selection, delete one character before the cursor
            if (pos > 0) {
                const before = value.substring(0, pos - 1);
                const after = value.substring(pos);
                this.inputElement.value = before + after;
                // Move the cursor one position back
                const newPos = pos - 1;
                this.inputElement.setSelectionRange(newPos, newPos);
            }
        }
        else {
            // If there's a selection, delete the selected range of text
            const before = value.substring(0, pos);
            const after = value.substring(posEnd);
            this.inputElement.value = before + after;
            // Set the cursor to the start of the deletion
            this.inputElement.setSelectionRange(pos, pos);
        }
        // Refocus the input element to ensure it stays focused
        this.inputElement.focus();
    }
    handleTabPress() {
        const inputList = Array.from(this.document.querySelectorAll(this.querySelector));
        const index = inputList.indexOf(this.inputElement);
        inputList[(index + 1) % inputList.length].focus();
    }
    handleSpacePress(pos, posEnd) {
        if (!this.inputElement || pos === null || posEnd === null)
            return;
        const value = this.inputElement.value;
        if (pos === posEnd) {
            // If there's no selection, insert a space at the cursor position
            const before = value.substring(0, pos);
            const after = value.substring(pos);
            this.inputElement.value = before + ' ' + after;
            // Move the cursor one position to the right
            const newPos = pos + 1;
            this.inputElement.setSelectionRange(newPos, newPos);
        }
        else {
            // If there's a selection, replace the selected text with a space
            const before = value.substring(0, pos);
            const after = value.substring(posEnd);
            this.inputElement.value = before + ' ' + after;
            // Set the cursor to the position after the inserted space
            this.inputElement.setSelectionRange(pos + 1, pos + 1);
        }
        // Refocus the input element to ensure it stays focused
        this.inputElement.focus();
    }
    handleDefaultKeyPress(button, pos, posEnd) {
        if (!this.inputElement || pos === null || posEnd === null)
            return;
        const value = this.inputElement.value;
        // Insert the button at the cursor position
        const before = value.substring(0, pos);
        const after = value.substring(posEnd);
        // Update the input value with the new character
        this.inputElement.value = before + button + after;
        // Update the cursor position explicitly to prevent reset
        const newPos = pos + button.length;
        //console.log(`Cursor position before: ${pos}, after: ${newPos}`);
        // Set the new cursor position
        this.inputElement.setSelectionRange(newPos, newPos);
        // Refocus the input element to prevent losing focus
        this.inputElement.focus();
    }
    performNativeKeyPress(element, keyCode) {
        const keydownEvent = new KeyboardEvent('keydown', { keyCode: keyCode, which: keyCode });
        const keypressEvent = new KeyboardEvent('keypress', { keyCode: keyCode, which: keyCode });
        const inputEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(keydownEvent);
        element.dispatchEvent(keypressEvent);
        element.dispatchEvent(inputEvent);
    }
    onFocus1(target) {
        this.inputElement = target;
        if (target.type.toLowerCase() === 'number') {
            this.keyboard.setOptions({
                layout: this.numericLayout,
                layoutName: 'default',
            });
        }
        else {
            this.keyboard.setOptions({
                ...this.languageLayout,
                layoutName: 'default',
            });
        }
        if (this.inputElement.matches('.no-keyboard')) {
            this.showKeyboardToggler();
            return;
        }
        this.hideKeyboardToggler();
        this.showKeyboard();
        const offset = 50;
        const bodyRect = this.document.body.getBoundingClientRect().top;
        const elementRect = this.inputElement.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    onFocus(target) {
        this.inputElement = target;
        // Check if the target is a text input, number input, or textarea
        if (target.type.toLowerCase() === 'text' || target.type.toLowerCase() === 'number' || target.tagName.toLowerCase() === 'textarea') {
            if (target.type.toLowerCase() === 'number') {
                this.keyboard.setOptions({
                    layout: this.numericLayout,
                    layoutName: 'default',
                });
            }
            else {
                this.keyboard.setOptions({
                    ...this.languageLayout,
                    layoutName: 'default',
                });
            }
            // Show keyboard and handle scrolling
            this.hideKeyboardToggler();
            this.showKeyboard();
            const offset = 50;
            const bodyRect = this.document.body.getBoundingClientRect().top;
            const elementRect = this.inputElement.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
        else {
            this.hideKeyboard();
            this.hideKeyboardToggler();
        }
    }
    showKeyboardToggler() {
        this.renderer.removeClass(this.keyboardToggler.nativeElement, 'hidden');
    }
    hideKeyboardToggler() {
        this.renderer.addClass(this.keyboardToggler.nativeElement, 'hidden');
    }
    toggleKeyboard() {
        if (this.keyboardContainer.nativeElement.style.display === 'none') {
            this.showKeyboard();
        }
    }
    onFocusOut() {
        if (this.inputElement) {
            this.inputElement.blur();
            this.inputElement = null;
        }
        this.hideKeyboard();
        this.hideKeyboardToggler();
    }
    showKeyboard() {
        const dialogs = this.document.querySelectorAll('.fixed-full');
        if (this.keyboardHideTask != null) {
            clearTimeout(this.keyboardHideTask);
            this.keyboardHideTask = null;
        }
        this.renderer.setStyle(this.keyboardContainer.nativeElement, 'display', 'block');
        const keyboardHeight = this.keyboardContainer.nativeElement.offsetHeight;
        const style = `padding-bottom: ${keyboardHeight}px !important`;
        this.renderer.setAttribute(this.document.body, 'style', style);
        dialogs.forEach(dialog => this.renderer.setAttribute(dialog, 'style', style));
    }
    checkKeyboard() {
        if (this.isMouseDown) {
            return;
        }
        const activeElement = this.document.activeElement;
        if (activeElement.matches(this.querySelector)) {
            if (this.inputElement !== activeElement) {
                this.onFocus(activeElement);
            }
        }
        else {
            if (this.inputElement !== null) {
                this.onFocusOut();
            }
        }
    }
    hideKeyboard() {
        this.keyboardHideTask = setTimeout(() => {
            const dialogs = this.document.querySelectorAll('.fixed-full');
            this.renderer.setStyle(this.keyboardContainer.nativeElement, 'display', 'none');
            this.renderer.removeAttribute(this.document.body, 'style');
            this.keyboardHideTask = null;
            dialogs.forEach(dialog => this.renderer.removeAttribute(dialog, 'style'));
        });
    }
    handleShiftPress() {
        this.shiftPressed = !this.shiftPressed;
        this.toggleShiftLayout();
    }
    handleCapsLockPressed() {
        this.toggleShiftLayout();
    }
    disableShiftPress() {
        if (!this.shiftPressed) {
            return;
        }
        this.shiftPressed = false;
        this.toggleShiftLayout();
    }
    toggleShiftLayout() {
        const currentLayout = this.keyboard.options.layoutName;
        const shiftToggle = currentLayout === 'default' ? 'shift' : 'default';
        this.keyboard.setOptions({
            layoutName: shiftToggle,
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxSimpleKeyboardKioskComponent, deps: [{ token: i0.Renderer2 }, { token: i1.CountryService }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "17.3.12", type: NgxSimpleKeyboardKioskComponent, selector: "ngx-simple-keyboard-kiosk", inputs: { defaultLanguage: "defaultLanguage", secondLanguage: "secondLanguage", removeks: "removeks" }, outputs: { languageChange: "languageChange" }, viewQueries: [{ propertyName: "keyboardContainer", first: true, predicate: ["keyboardContainer"], descendants: true, static: true }, { propertyName: "keyboardToggler", first: true, predicate: ["keyboardToggler"], descendants: true, static: true }], ngImport: i0, template: `
<div id="virtual-keyboard" >

 <div #keyboardContainer>
 
      <div #keyboardToggler id="keyboard-toggler" class="keyboard-wrapper simple-keyboard" (click)="toggleKeyboard()"></div>
    </div>
</div>
  `, isInline: true, styles: ["#virtual-keyboard{top:unset;bottom:0;border-radius:2px 2px 0 0;box-sizing:border-box!important;position:fixed;z-index:20000;width:100%;max-width:1440px;background:#e3e3e3;background:linear-gradient(to right bottom,#eee,#ebebeb,#e8e8e8,#e6e6e6,#e3e3e3);-webkit-box-shadow:inset 1px 1px 0 rgba(255,255,255,.25),0 0 20px -8px rgba(0,0,0,.15);box-shadow:inset 1px 1px #ffffff40,0 0 20px -8px #00000026;padding:2px;left:0;right:0;margin:auto}#virtual-keyboard .keyboard-wrapper{position:relative;background:inherit;width:100%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;box-sizing:border-box!important}\n"] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxSimpleKeyboardKioskComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-simple-keyboard-kiosk', template: `
<div id="virtual-keyboard" >

 <div #keyboardContainer>
 
      <div #keyboardToggler id="keyboard-toggler" class="keyboard-wrapper simple-keyboard" (click)="toggleKeyboard()"></div>
    </div>
</div>
  `, styles: ["#virtual-keyboard{top:unset;bottom:0;border-radius:2px 2px 0 0;box-sizing:border-box!important;position:fixed;z-index:20000;width:100%;max-width:1440px;background:#e3e3e3;background:linear-gradient(to right bottom,#eee,#ebebeb,#e8e8e8,#e6e6e6,#e3e3e3);-webkit-box-shadow:inset 1px 1px 0 rgba(255,255,255,.25),0 0 20px -8px rgba(0,0,0,.15);box-shadow:inset 1px 1px #ffffff40,0 0 20px -8px #00000026;padding:2px;left:0;right:0;margin:auto}#virtual-keyboard .keyboard-wrapper{position:relative;background:inherit;width:100%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;box-sizing:border-box!important}\n"] }]
        }], ctorParameters: () => [{ type: i0.Renderer2 }, { type: i1.CountryService }, { type: Document, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }], propDecorators: { keyboardContainer: [{
                type: ViewChild,
                args: ['keyboardContainer', { static: true }]
            }], keyboardToggler: [{
                type: ViewChild,
                args: ['keyboardToggler', { static: true }]
            }], defaultLanguage: [{
                type: Input
            }], secondLanguage: [{
                type: Input
            }], removeks: [{
                type: Input
            }], languageChange: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXNpbXBsZS1rZXlib2FyZC1raW9zay5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtc2ltcGxlLWtleWJvYXJkLWtpb3NrL3NyYy9saWIvbmd4LXNpbXBsZS1rZXlib2FyZC1raW9zay5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBc0IsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFhLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6SCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDM0MsT0FBTyxRQUE2QixNQUFNLGlCQUFpQixDQUFDO0FBQzVELE9BQU8scUJBQXFCLE1BQU8seUJBQXlCLENBQUM7QUFDN0QsT0FBTyxhQUFhLE1BQU0sK0NBQStDLENBQUM7QUFDMUUsT0FBTyxjQUFjLE1BQU0sZ0RBQWdELENBQUM7OztBQXNCNUUsTUFBTSxPQUFPLCtCQUErQjtJQXFDMUMsWUFDVSxRQUFtQixFQUNuQixLQUFxQixFQUNILFFBQWtCO1FBRnBDLGFBQVEsR0FBUixRQUFRLENBQVc7UUFDbkIsVUFBSyxHQUFMLEtBQUssQ0FBZ0I7UUFDSCxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBckJwQyxtQkFBYyxHQUFHLElBQUksWUFBWSxFQUFVLENBQUM7UUFHOUMsaUJBQVksR0FBNEIsSUFBSSxDQUFDO1FBQzdDLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLG1CQUFjLEdBQVEsYUFBYSxDQUFDO1FBQ3BDLG9CQUFlLEdBQVEsYUFBYSxDQUFDO1FBR3JDLHFCQUFnQixHQUFRLElBQUksQ0FBQztRQUVwQixrQkFBYSxHQUFHO1lBQy9CLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLCtCQUErQixD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QVM7dUJBQUMsaUJBQWlCLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO2dCQUVyQyxlQUFlO3NCQUF2QixLQUFLO2dCQUNHLGNBQWM7c0JBQXRCLEtBQUs7Z0JBQ0csUUFBUTtzQkFBaEIsS0FBSztnQkFJSSxjQUFjO3NCQUF2QixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQsIEVsZW1lbnRSZWYsIFZpZXdDaGlsZCwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBSZW5kZXJlcjIsIEluamVjdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBET0NVTUVOVCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCBLZXlib2FyZCwgeyBLZXlib2FyZEVsZW1lbnQgfSBmcm9tICdzaW1wbGUta2V5Ym9hcmQnO1xyXG5pbXBvcnQgU2ltcGxlS2V5Ym9hcmRMYXlvdXRzICBmcm9tIFwic2ltcGxlLWtleWJvYXJkLWxheW91dHNcIjtcclxuaW1wb3J0IGVuZ2xpc2hMYXlvdXQgZnJvbSBcInNpbXBsZS1rZXlib2FyZC1sYXlvdXRzL2J1aWxkL2xheW91dHMvZW5nbGlzaFwiO1xyXG5pbXBvcnQgZ2VvcmdpYW5sYXlvdXQgZnJvbSBcInNpbXBsZS1rZXlib2FyZC1sYXlvdXRzL2J1aWxkL2xheW91dHMvZ2VvcmdpYW5cIjtcclxuXHJcbmltcG9ydCB7IENvdW50cnlTZXJ2aWNlIH0gZnJvbSAnLi9jb3VudHJ5LnNlcnZpY2UnO1xyXG5cclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnbmd4LXNpbXBsZS1rZXlib2FyZC1raW9zaycsXHJcblxyXG5cclxuXHJcbiAgdGVtcGxhdGU6IGBcclxuPGRpdiBpZD1cInZpcnR1YWwta2V5Ym9hcmRcIiA+XHJcblxyXG4gPGRpdiAja2V5Ym9hcmRDb250YWluZXI+XHJcbiBcclxuICAgICAgPGRpdiAja2V5Ym9hcmRUb2dnbGVyIGlkPVwia2V5Ym9hcmQtdG9nZ2xlclwiIGNsYXNzPVwia2V5Ym9hcmQtd3JhcHBlciBzaW1wbGUta2V5Ym9hcmRcIiAoY2xpY2spPVwidG9nZ2xlS2V5Ym9hcmQoKVwiPjwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbjwvZGl2PlxyXG4gIGAsXHJcbiAgICBzdHlsZVVybHM6IFsnbmd4LXNpbXBsZS1rZXlib2FyZC1raW9zay5jb21wb25lbnQuc2NzcyddLFxyXG5cclxufSlcclxuZXhwb3J0IGNsYXNzIE5neFNpbXBsZUtleWJvYXJkS2lvc2tDb21wb25lbnQgIGltcGxlbWVudHMgT25Jbml0IHtcclxuXHJcblxyXG4gIFxyXG5cclxuICBcclxuXHJcblxyXG5cclxuXHJcbiAgQFZpZXdDaGlsZCgna2V5Ym9hcmRDb250YWluZXInLCB7IHN0YXRpYzogdHJ1ZSB9KSBrZXlib2FyZENvbnRhaW5lciE6IEVsZW1lbnRSZWY7XHJcbiAgQFZpZXdDaGlsZCgna2V5Ym9hcmRUb2dnbGVyJywgeyBzdGF0aWM6IHRydWUgfSkga2V5Ym9hcmRUb2dnbGVyITogRWxlbWVudFJlZjtcclxuICAvL0BJbnB1dCgpIGRlZmF1bHRMYW5ndWFnZTogJ2VuZ2xpc2gnIHwgJ2dlcm1hbicgPSAnZW5nbGlzaCc7XHJcbiAgQElucHV0KCkgZGVmYXVsdExhbmd1YWdlITogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHNlY29uZExhbmd1YWdlITogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHJlbW92ZWtzITphbnlbXVxyXG4gIHByaXZhdGUgb3JpZ2luYWxEZWZhdWx0TGFuZ3VhZ2UhOiBzdHJpbmc7XHJcblxyXG5cclxuICBAT3V0cHV0KCkgbGFuZ3VhZ2VDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPHN0cmluZz4oKTtcclxuXHJcbiAgcHJpdmF0ZSBrZXlib2FyZDphbnlcclxuICBwcml2YXRlIGlucHV0RWxlbWVudDogSFRNTElucHV0RWxlbWVudCB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgc2hpZnRQcmVzc2VkID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBpc01vdXNlRG93biA9IGZhbHNlO1xyXG4gIHByaXZhdGUgbGFuZ3VhZ2VMYXlvdXQ6IGFueSA9IGVuZ2xpc2hMYXlvdXQ7XHJcbiAgcHJpdmF0ZSBsYW5ndWFnZUxheW91dHM6IGFueSA9IGVuZ2xpc2hMYXlvdXQ7XHJcbiAgcHJpdmF0ZSBmbGFnVXJsOmFueVxyXG5cclxuICBwcml2YXRlIGtleWJvYXJkSGlkZVRhc2s6IGFueSA9IG51bGw7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbnVtZXJpY0xheW91dCA9IHtcclxuICAgIGRlZmF1bHQ6IFsnMSAyIDMnLCAnNCA1IDYnLCAnNyA4IDknLCAne3RhYn0gMCB7YmtzcH0ge2Rvd25rZXlib2FyZH0nXSxcclxuICB9O1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IHF1ZXJ5U2VsZWN0b3IgPSAnaW5wdXQ6bm90KFtyZWFkb25seV0pLCB0ZXh0YXJlYTpub3QoW3JlYWRvbmx5XSknO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcmVuZGVyZXI6IFJlbmRlcmVyMixcclxuICAgIHByaXZhdGUgZmxhZ3M6IENvdW50cnlTZXJ2aWNlLFxyXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBkb2N1bWVudDogRG9jdW1lbnQsXHJcblxyXG4gICkge1xyXG5cclxuXHJcblxyXG4gIH1cclxuXHJcbiAgbmdPbkluaXQoKSB7XHJcblxyXG5cclxuXHJcblxyXG4gICAgXHJcbiAgXHJcblxyXG4gICAgdGhpcy5vcmlnaW5hbERlZmF1bHRMYW5ndWFnZSA9IHRoaXMuZGVmYXVsdExhbmd1YWdlOyAvLyBTdG9yZSB0aGUgb3JpZ2luYWwgZGVmYXVsdCBsYW5ndWFnZVxyXG5cclxuICAgIFxyXG4gICAgdGhpcy5zZXR1cEtleWJvYXJkKCk7XHJcbiAgICB0aGlzLnNldHVwRXZlbnRMaXN0ZW5lcnMoKTtcclxuICAgICAgICB0aGlzLmtleWJvYXJkQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJzsgIC8vIEluaXRpYWxseSBoaWRlIHRoZSBrZXlib2FyZFxyXG4gICAgICAgICB9XHJcblxyXG5cclxuXHJcbnByaXZhdGUgc2V0dXBLZXlib2FyZCgpIHtcclxuICAvLyBJbml0aWFsaXplIGF2YWlsYWJsZSBsYXlvdXRzXHJcbiAgbGV0IGxheW91dHNJbnN0YW5jZSA9IG5ldyBTaW1wbGVLZXlib2FyZExheW91dHMoKTtcclxuICB0aGlzLmxhbmd1YWdlTGF5b3V0cyA9IGxheW91dHNJbnN0YW5jZS5sYXlvdXRzO1xyXG4gIFxyXG4gIC8vIEF1dG9tYXRpY2FsbHkgc2V0IGxhbmd1YWdlIGxheW91dCBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgbGFuZ3VhZ2VzXHJcbiAgdGhpcy5sYW5ndWFnZUxheW91dCA9IHRoaXMubGFuZ3VhZ2VMYXlvdXRzW3RoaXMuZGVmYXVsdExhbmd1YWdlXSBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfHwgdGhpcy5sYW5ndWFnZUxheW91dHNbJ2VuZ2xpc2gnXTsgLy8gRmFsbGJhY2sgdG8gRW5nbGlzaCBpZiBub3QgZm91bmRcclxuXHJcbiAgICAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2Vjb25kTGFuZ3VhZ2U9PT0nZW5nbGlzaCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZsYWdVcmw9dGhpcy5mbGFncy5nZXRGbGFnKCdlbmdsaXNoJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmxhZ1VybD10aGlzLmZsYWdzLmdldEZsYWcodGhpcy5zZWNvbmRMYW5ndWFnZSlcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgXHJcblxyXG4gIGNvbnN0IGtleVJvd3NEZWZhdWx0ID0gdGhpcy5sYW5ndWFnZUxheW91dC5sYXlvdXQuZGVmYXVsdDtcclxuICAvL2tleVJvd3NEZWZhdWx0W2tleVJvd3NEZWZhdWx0Lmxlbmd0aCAtIDFdICs9ICcge2Rvd25rZXlib2FyZH0ge2xhbmd9JztcclxuIC8vIGtleVJvd3NEZWZhdWx0W2tleVJvd3NEZWZhdWx0Lmxlbmd0aCAtIDFdICs9ICcge2Rvd25rZXlib2FyZH0ge2xhbmd9JztcclxuIGxldCBsYXN0Um93ID0ga2V5Um93c0RlZmF1bHRba2V5Um93c0RlZmF1bHQubGVuZ3RoIC0gMV07XHJcblxyXG4gbGFzdFJvdyA9IGxhc3RSb3cucmVwbGFjZSgne3NwYWNlfScsICd7bGFuZ30ge3NwYWNlfSB7ZG93bmtleWJvYXJkfScpO1xyXG4ga2V5Um93c0RlZmF1bHRba2V5Um93c0RlZmF1bHQubGVuZ3RoIC0gMV0gPSBsYXN0Um93O1xyXG5cclxuICBcclxuIFxyXG4gIGNvbnN0IGtleVJvd3NTaGlmdCA9IHRoaXMubGFuZ3VhZ2VMYXlvdXQubGF5b3V0LnNoaWZ0O1xyXG4gLy8ga2V5Um93c1NoaWZ0W2tleVJvd3NTaGlmdC5sZW5ndGggLSAxXSArPSAnIHtkb3dua2V5Ym9hcmR9JztcclxuLy8ga2V5Um93c1NoaWZ0W2tleVJvd3NTaGlmdC5sZW5ndGggLSAxXSArPSAnIHtkb3dua2V5Ym9hcmR9IHtsYW5nfSc7XHJcbiBrZXlSb3dzU2hpZnRba2V5Um93c1NoaWZ0Lmxlbmd0aCAtIDFdID0gIGxhc3RSb3c7XHJcblxyXG5cclxuXHJcbmNvbnN0IHJlbW92ZUtleXMgPSAocm93OiBzdHJpbmcsIGtleXNUb1JlbW92ZTogc3RyaW5nW10pID0+IHtcclxuICByZXR1cm4gcm93LnNwbGl0KCcgJykuZmlsdGVyKGtleSA9PiAha2V5c1RvUmVtb3ZlLmluY2x1ZGVzKGtleSkpLmpvaW4oJyAnKTtcclxufTtcclxuXHJcbmlmICh0aGlzLnJlbW92ZWtzICYmIHRoaXMucmVtb3Zla3MubGVuZ3RoID4gMCkge1xyXG4gIGlmIChrZXlSb3dzRGVmYXVsdC5sZW5ndGggPiAwKSB7XHJcbiAgICBrZXlSb3dzRGVmYXVsdC5mb3JFYWNoKChyb3c6IGFueSwgaW5kZXg6IGFueSkgPT4ge1xyXG4gICAgICBrZXlSb3dzRGVmYXVsdFtpbmRleF0gPSByZW1vdmVLZXlzKHJvdywgdGhpcy5yZW1vdmVrcyk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGlmIChrZXlSb3dzU2hpZnQubGVuZ3RoID4gMCkge1xyXG4gICAga2V5Um93c1NoaWZ0LmZvckVhY2goKHJvdzogYW55LCBpbmRleDogYW55KSA9PiB7XHJcbiAgICAgIGtleVJvd3NTaGlmdFtpbmRleF0gPSByZW1vdmVLZXlzKHJvdywgdGhpcy5yZW1vdmVrcyk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbiAgXHJcbiAgdGhpcy5rZXlib2FyZCA9IG5ldyBLZXlib2FyZCh7XHJcbiAgICBvbkNoYW5nZTogKGlucHV0OiBzdHJpbmcpID0+IHRoaXMub25DaGFuZ2UoaW5wdXQpLFxyXG4gICAgb25LZXlQcmVzczogKGJ1dHRvbjogc3RyaW5nKSA9PiB0aGlzLm9uS2V5UHJlc3MoYnV0dG9uKSxcclxuICAgIG9uS2V5UmVsZWFzZWQ6IChidXR0b246IHN0cmluZykgPT4gdGhpcy5vbktleVJlbGVhc2UoYnV0dG9uKSxcclxuXHJcbiAgICBcclxuICAgIC4uLnRoaXMubGFuZ3VhZ2VMYXlvdXQsXHJcblxyXG4gICAgZGlzcGxheToge1xyXG4gICAgICAne3RhYn0nOiAn4oa5JyxcclxuICAgICAgJ3tia3NwfSc6ICfijKsnLFxyXG4gICAgICAne2Rvd25rZXlib2FyZH0nOiAnPHN2ZyBjbGFzcz1cInctNiBoLTYgdGV4dC1ncmF5LTgwMCBkYXJrOnRleHQtd2hpdGVcIiBhcmlhLWhpZGRlbj1cInRydWVcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj4gPHBhdGggZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGQ9XCJNMiAxMkMyIDYuNDc3IDYuNDc3IDIgMTIgMnMxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMFMyIDE3LjUyMyAyIDEyWm03LjcwNy0zLjcwN2ExIDEgMCAwIDAtMS40MTQgMS40MTRMMTAuNTg2IDEybC0yLjI5MyAyLjI5M2ExIDEgMCAxIDAgMS40MTQgMS40MTRMMTIgMTMuNDE0bDIuMjkzIDIuMjkzYTEgMSAwIDAgMCAxLjQxNC0xLjQxNEwxMy40MTQgMTJsMi4yOTMtMi4yOTNhMSAxIDAgMCAwLTEuNDE0LTEuNDE0TDEyIDEwLjU4NiA5LjcwNyA4LjI5M1pcIiBjbGlwLXJ1bGU9XCJldmVub2RkXCIvPiA8L3N2Zz4nLFxyXG4gICAgICAne3NwYWNlfSc6ICcgJyxcclxuICAgICAgJ3tsYW5nfSc6IGAke3RoaXMuZmxhZ1VybH1gLCBcclxuICAgICAgJ3tsb2NrfSc6ICfih6onLFxyXG4gICAgICAne3NoaWZ0fSc6ICfih6cnLFxyXG4gICAgICAne2VudGVyfSc6ICfihrUnLFxyXG4gICAgfSxcclxuICB9KTtcclxuXHJcblxyXG5cclxuICB0aGlzLmhpZGVLZXlib2FyZCgpO1xyXG59XHJcblxyXG5cclxuICBcclxuXHJcblxyXG5cclxucHJpdmF0ZSBzZXR1cEV2ZW50TGlzdGVuZXJzKCkge1xyXG4gIHRoaXMucmVuZGVyZXIubGlzdGVuKCd3aW5kb3cnLCAnZm9jdXNpbicsIChldmVudDogRm9jdXNFdmVudCkgPT4ge1xyXG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBpZiAodGFyZ2V0ICYmIHRhcmdldC5tYXRjaGVzKHRoaXMucXVlcnlTZWxlY3RvcikpIHtcclxuICAgICAgdGhpcy5vbkZvY3VzKHRhcmdldCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGNvbnN0IGV2ZW50cyA9IFsnbW91c2Vkb3duJywgJ21vdXNldXAnLCAndG91Y2hzdGFydCcsICd0b3VjaGVuZCddO1xyXG4gIGV2ZW50cy5mb3JFYWNoKGV2ZW50TmFtZSA9PiB7XHJcbiAgICB0aGlzLnJlbmRlcmVyLmxpc3RlbignYm9keScsIGV2ZW50TmFtZSwgKGV2ZW50OiBFdmVudCkgPT4ge1xyXG4gICAgICBpZiAoZXZlbnROYW1lID09PSAnbW91c2V1cCcpIHtcclxuICAgICAgICB0aGlzLm9uTW91c2VVcChldmVudCBhcyBNb3VzZUV2ZW50KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuaXNDaGlsZEVsZW1lbnQoZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50LCB0aGlzLmtleWJvYXJkQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQpKSB7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsgIC8vIFByZXZlbnRzIGlucHV0IGJsdXIgd2hlbiBpbnRlcmFjdGluZyB3aXRoIHRoZSBrZXlib2FyZFxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuXHJcblxyXG4gIHByaXZhdGUgc2V0dXBFdmVudExpc3RlbmVyc09MRCgpIHtcclxuICAgIHRoaXMucmVuZGVyZXIubGlzdGVuKCd3aW5kb3cnLCAnZm9jdXNpbicsIChldmVudDogRm9jdXNFdmVudCkgPT4ge1xyXG4gICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgXHJcbiAgICAgIGlmICh0YXJnZXQgJiYgdGFyZ2V0Lm1hdGNoZXModGhpcy5xdWVyeVNlbGVjdG9yKSkge1xyXG4gICAgICAgIHRoaXMub25Gb2N1cyh0YXJnZXQpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICBcclxuICAgIGNvbnN0IGV2ZW50cyA9IFsnbW91c2Vkb3duJywgJ21vdXNldXAnLCAndG91Y2hzdGFydCcsICd0b3VjaGVuZCddO1xyXG4gICAgZXZlbnRzLmZvckVhY2goZXZlbnROYW1lID0+IHtcclxuICAgICAgdGhpcy5yZW5kZXJlci5saXN0ZW4oJ2JvZHknLCBldmVudE5hbWUsIChldmVudDogRXZlbnQpID0+IHtcclxuICAgICAgICBpZiAodGhpcy5pc0NoaWxkRWxlbWVudChldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQsIHRoaXMua2V5Ym9hcmRDb250YWluZXIubmF0aXZlRWxlbWVudCkpIHtcclxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7ICAvLyBQcmV2ZW50cyBpbnB1dCBibHVyIHdoZW4gaW50ZXJhY3Rpbmcgd2l0aCB0aGUga2V5Ym9hcmRcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIFxyXG4gIFxyXG5cclxuXHJcblxyXG5cclxuICBwcml2YXRlIHVwZGF0ZUtleWJvYXJkTGF5b3V0KCkge1xyXG5cclxuICAgIGNvbnN0IGxheW91dCA9IHRoaXMuZGVmYXVsdExhbmd1YWdlID09PSAnZW5nbGlzaCcgPyBlbmdsaXNoTGF5b3V0IDogZ2VvcmdpYW5sYXlvdXQ7XHJcbiAgICBcclxuXHJcbiAgICB0aGlzLnN3aXRjaExhbmd1YWdlKCdlbmdsaXNoJylcclxuICBcclxuICB9XHJcblxyXG5cclxuICBzd2l0Y2hMYW5ndWFnZShsYW5ndWFnZTogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBsYXlvdXRzSW5zdGFuY2UgPSBuZXcgU2ltcGxlS2V5Ym9hcmRMYXlvdXRzKCk7XHJcbiAgICB0aGlzLmxhbmd1YWdlTGF5b3V0cyA9IGxheW91dHNJbnN0YW5jZS5sYXlvdXRzO1xyXG4gIFxyXG4gICAgdGhpcy5sYW5ndWFnZUxheW91dCA9IHRoaXMubGFuZ3VhZ2VMYXlvdXRzW2xhbmd1YWdlXSB8fCB0aGlzLmxhbmd1YWdlTGF5b3V0c1snZW5nbGlzaCddOyBcclxuICBcclxuICAgIGlmIChsYW5ndWFnZSA9PT0gdGhpcy5vcmlnaW5hbERlZmF1bHRMYW5ndWFnZSkge1xyXG4gICAgICBcclxuICAgICAgdGhpcy5mbGFnVXJsID0gdGhpcy5mbGFncy5nZXRGbGFnKHRoaXMuc2Vjb25kTGFuZ3VhZ2UpOyBcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZmxhZ1VybCA9dGhpcy5mbGFncy5nZXRGbGFnKHRoaXMub3JpZ2luYWxEZWZhdWx0TGFuZ3VhZ2UpOyBcclxuICAgIH1cclxuICBcclxuICAgIGNvbnN0IGtleVJvd3NEZWZhdWx0ID0gdGhpcy5sYW5ndWFnZUxheW91dC5sYXlvdXQuZGVmYXVsdDtcclxuICAgIGNvbnN0IGtleVJvd3NTaGlmdCA9IHRoaXMubGFuZ3VhZ2VMYXlvdXQubGF5b3V0LnNoaWZ0O1xyXG4gIFxyXG5cclxuICAgIGNvbnN0IHJlbW92ZUtleXMgPSAocm93OiBzdHJpbmcsIGtleXNUb1JlbW92ZTogc3RyaW5nW10pID0+IHtcclxuICAgICAgcmV0dXJuIHJvdy5zcGxpdCgnICcpLmZpbHRlcihrZXkgPT4gIWtleXNUb1JlbW92ZS5pbmNsdWRlcyhrZXkpKS5qb2luKCcgJyk7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICBpZiAodGhpcy5yZW1vdmVrcyAmJiB0aGlzLnJlbW92ZWtzLmxlbmd0aCA+IDApIHtcclxuICAgICAgaWYgKGtleVJvd3NEZWZhdWx0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICBrZXlSb3dzRGVmYXVsdC5mb3JFYWNoKChyb3c6IGFueSwgaW5kZXg6IGFueSkgPT4ge1xyXG4gICAgICAgICAga2V5Um93c0RlZmF1bHRbaW5kZXhdID0gcmVtb3ZlS2V5cyhyb3csIHRoaXMucmVtb3Zla3MpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICBcclxuICAgICAgaWYgKGtleVJvd3NTaGlmdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAga2V5Um93c1NoaWZ0LmZvckVhY2goKHJvdzogYW55LCBpbmRleDogYW55KSA9PiB7XHJcbiAgICAgICAgICBrZXlSb3dzU2hpZnRbaW5kZXhdID0gcmVtb3ZlS2V5cyhyb3csIHRoaXMucmVtb3Zla3MpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuXHJcbiAgICBjb25zdCBhZGRTcGVjaWFsQnV0dG9ucyA9IChyb3c6IHN0cmluZykgPT4ge1xyXG4gICAgICBpZiAocm93LmluY2x1ZGVzKCd7c3BhY2V9JykgJiYgIXJvdy5pbmNsdWRlcygne2xhbmd9JykgJiYgIXJvdy5pbmNsdWRlcygne2Rvd25rZXlib2FyZH0nKSkge1xyXG4gICAgICAgIHJvdyA9IHJvdy5yZXBsYWNlKCd7c3BhY2V9JywgJ3tsYW5nfSB7c3BhY2V9IHtkb3dua2V5Ym9hcmR9Jyk7XHJcbiAgICAgIH1cclxuICAgIFxyXG4gICAgICByZXR1cm4gcm93O1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgaWYgKGtleVJvd3NEZWZhdWx0Lmxlbmd0aCA+IDApIHtcclxuICAgICAga2V5Um93c0RlZmF1bHRba2V5Um93c0RlZmF1bHQubGVuZ3RoIC0gMV0gPSBhZGRTcGVjaWFsQnV0dG9ucyhrZXlSb3dzRGVmYXVsdFtrZXlSb3dzRGVmYXVsdC5sZW5ndGggLSAxXSk7XHJcbiAgICB9XHJcbiAgICBpZiAoa2V5Um93c1NoaWZ0Lmxlbmd0aCA+IDApIHtcclxuICAgICAga2V5Um93c1NoaWZ0W2tleVJvd3NTaGlmdC5sZW5ndGggLSAxXSA9IGFkZFNwZWNpYWxCdXR0b25zKGtleVJvd3NTaGlmdFtrZXlSb3dzU2hpZnQubGVuZ3RoIC0gMV0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgXHJcbiAgICAvLyBTZXQgdGhlIG9wdGlvbnMgb24gdGhlIGtleWJvYXJkXHJcbiAgICBpZiAodGhpcy5rZXlib2FyZCkge1xyXG4gICAgICB0aGlzLmtleWJvYXJkLnNldE9wdGlvbnMoe1xyXG4gICAgICAgIC4uLnRoaXMubGFuZ3VhZ2VMYXlvdXQsXHJcbiAgICAgICAgbGF5b3V0TmFtZTogJ2RlZmF1bHQnLFxyXG4gICAgICAgIGRpc3BsYXk6IHtcclxuICAgICAgICAgICd7dGFifSc6ICfihrknLFxyXG4gICAgICAgICAgJ3tia3NwfSc6ICfijKsnLFxyXG4gICAgICAgICAgJ3tkb3dua2V5Ym9hcmR9JzogJzxzdmcgY2xhc3M9XCJ3LTYgaC02IHRleHQtZ3JheS04MDAgZGFyazp0ZXh0LXdoaXRlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMjRcIiBoZWlnaHQ9XCIyNFwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+IDxwYXRoIGZpbGwtcnVsZT1cImV2ZW5vZGRcIiBkPVwiTTIgMTJDMiA2LjQ3NyA2LjQ3NyAyIDEyIDJzMTAgNC40NzcgMTAgMTAtNC40NzcgMTAtMTAgMTBTMiAxNy41MjMgMiAxMlptNy43MDctMy43MDdhMSAxIDAgMCAwLTEuNDE0IDEuNDE0TDEwLjU4NiAxMmwtMi4yOTMgMi4yOTNhMSAxIDAgMSAwIDEuNDE0IDEuNDE0TDEyIDEzLjQxNGwyLjI5MyAyLjI5M2ExIDEgMCAwIDAgMS40MTQtMS40MTRMMTMuNDE0IDEybDIuMjkzLTIuMjkzYTEgMSAwIDAgMC0xLjQxNC0xLjQxNEwxMiAxMC41ODYgOS43MDcgOC4yOTNaXCIgY2xpcC1ydWxlPVwiZXZlbm9kZFwiLz4gPC9zdmc+JyxcclxuICAgICAgICAgICd7c3BhY2V9JzogJyAnLFxyXG4gICAgICAgICAgJ3tsYW5nfSc6IGAke3RoaXMuZmxhZ1VybH1gLCBcclxuICAgICAgICAgICd7bG9ja30nOiAn4oeqJyxcclxuICAgICAgICAgICd7c2hpZnR9JzogJ+KHpycsXHJcbiAgICAgICAgICAne2VudGVyfSc6ICfihrUnLFxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgXHJcbiAgICAvLyBFbWl0IHRoZSBsYW5ndWFnZSBjaGFuZ2VcclxuICAgIHRoaXMubGFuZ3VhZ2VDaGFuZ2UuZW1pdChsYW5ndWFnZSk7XHJcbiAgfVxyXG4gIFxyXG5cclxuXHJcblxyXG5cclxuICBzd2l0Y2hMYW5ndWFnZW9sZChsYW5ndWFnZTogJ2VuZ2xpc2gnIHwgJ2dlb3JnaWFuJykge1xyXG5cclxuXHJcbiAgICBcclxuXHJcbiAgICB0aGlzLmxhbmd1YWdlTGF5b3V0ID0gdGhpcy5kZWZhdWx0TGFuZ3VhZ2UgPT09ICdlbmdsaXNoJyA/IGVuZ2xpc2hMYXlvdXQgOiBnZW9yZ2lhbmxheW91dDtcclxuXHJcbiAgICBjb25zdCBrZXlSb3dzRGVmYXVsdCA9IHRoaXMubGFuZ3VhZ2VMYXlvdXQubGF5b3V0LmRlZmF1bHQ7XHJcbiAgICBrZXlSb3dzRGVmYXVsdFtrZXlSb3dzRGVmYXVsdC5sZW5ndGggLSAxXSArPSAnIHtkb3dua2V5Ym9hcmR9JztcclxuICAgIGtleVJvd3NEZWZhdWx0W2tleVJvd3NEZWZhdWx0Lmxlbmd0aCAtIDFdICs9ICcge2xhbmd9JztcclxuXHJcbiAgICBjb25zdCBrZXlSb3dzU2hpZnQgPSB0aGlzLmxhbmd1YWdlTGF5b3V0LmxheW91dC5zaGlmdDtcclxuICAgIGtleVJvd3NTaGlmdFtrZXlSb3dzU2hpZnQubGVuZ3RoIC0gMV0gKz0gJyB7ZG93bmtleWJvYXJkfSc7XHJcbiAgIFxyXG5cclxuXHJcbiAgICBpZiAodGhpcy5rZXlib2FyZCkge1xyXG4gICAgICB0aGlzLmtleWJvYXJkLnNldE9wdGlvbnMoe1xyXG4gICAgICAgIC4uLnRoaXMubGFuZ3VhZ2VMYXlvdXQsXHJcbiAgICAgICAgZGlzcGxheToge1xyXG4gICAgICAgICAgJ3t0YWJ9JzogJ+KGuScsXHJcbiAgICAgICAgICAne2Jrc3B9JzogJ+KMqycsXHJcbiAgICAgICAgICAne2Rvd25rZXlib2FyZH0nOiAnPHN2ZyBjbGFzcz1cInctNiBoLTYgdGV4dC1ncmF5LTgwMCBkYXJrOnRleHQtd2hpdGVcIiBhcmlhLWhpZGRlbj1cInRydWVcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj4gPHBhdGggZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGQ9XCJNMiAxMkMyIDYuNDc3IDYuNDc3IDIgMTIgMnMxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMFMyIDE3LjUyMyAyIDEyWm03LjcwNy0zLjcwN2ExIDEgMCAwIDAtMS40MTQgMS40MTRMMTAuNTg2IDEybC0yLjI5MyAyLjI5M2ExIDEgMCAxIDAgMS40MTQgMS40MTRMMTIgMTMuNDE0bDIuMjkzIDIuMjkzYTEgMSAwIDAgMCAxLjQxNC0xLjQxNEwxMy40MTQgMTJsMi4yOTMtMi4yOTNhMSAxIDAgMCAwLTEuNDE0LTEuNDE0TDEyIDEwLjU4NiA5LjcwNyA4LjI5M1pcIiBjbGlwLXJ1bGU9XCJldmVub2RkXCIvPiA8L3N2Zz4nLFxyXG4gICAgICAgICAgJ3tzcGFjZX0nOiAnICcsXHJcbiAgICAgICAgICAne2xhbmd9JzogXCJMQU5HXCIsXHJcbiAgICAgICAgICAne2xvY2t9JzogJ+KHqicsXHJcbiAgICAgICAgICAne3NoaWZ0fSc6ICfih6cnLFxyXG4gICAgICAgICAgJ3tlbnRlcn0nOiAn4oa1JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxheW91dE5hbWU6ICdkZWZhdWx0JyxcclxuXHJcbiAgICAgICAgXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLnRvZ2dsZVNoaWZ0TGF5b3V0KCk7XHJcbiAgICAgIHRoaXMudG9nZ2xlU2hpZnRMYXlvdXQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICBcclxuICBcclxuXHJcbiAgcHJpdmF0ZSBpc0NoaWxkRWxlbWVudChjaGlsZDogSFRNTEVsZW1lbnQsIHRhcmdldDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcclxuICAgIGlmICh0YXJnZXQgPT09IGNoaWxkKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKGNoaWxkLnBhcmVudEVsZW1lbnQpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaXNDaGlsZEVsZW1lbnQoY2hpbGQucGFyZW50RWxlbWVudCwgdGFyZ2V0KTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIFxyXG5cclxuICBwcml2YXRlIG9uQ2hhbmdlKGlucHV0OiBzdHJpbmcpIHtcclxuICAgIC8vIEhhbmRsZSBpbnB1dCBjaGFuZ2UgaWYgbmVlZGVkXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uS2V5UHJlc3MoYnV0dG9uOiBzdHJpbmcpIHtcclxuXHJcblxyXG5cclxuICAgIFxyXG4gICAgaWYgKCF0aGlzLmlucHV0RWxlbWVudCB8fCAhYnV0dG9uKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHBvcyA9IHRoaXMuaW5wdXRFbGVtZW50LnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgY29uc3QgcG9zRW5kID0gdGhpcy5pbnB1dEVsZW1lbnQuc2VsZWN0aW9uRW5kO1xyXG5cclxuICAgIGlmICh0aGlzLmlucHV0RWxlbWVudC50eXBlLnRvTG93ZXJDYXNlKCkgPT09ICdudW1iZXInICYmIGJ1dHRvbiAhPT0gJ3t0YWJ9JyAmJiBidXR0b24gIT09ICd7ZG93bmtleWJvYXJkfScpIHtcclxuICAgICAgdGhpcy5vbktleVByZXNzTnVtZXJpYyhidXR0b24pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoIChidXR0b24pIHtcclxuICAgICAgY2FzZSAne3NoaWZ0fSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVTaGlmdFByZXNzKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3tsb2NrfSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVDYXBzTG9ja1ByZXNzZWQoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAne2VudGVyfSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVFbnRlclByZXNzKHBvcywgcG9zRW5kKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAne2Jrc3B9JzpcclxuICAgICAgICB0aGlzLmhhbmRsZUJhY2tzcGFjZVByZXNzKHBvcywgcG9zRW5kKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAne3RhYn0nOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlVGFiUHJlc3MoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAne2Rvd25rZXlib2FyZH0nOlxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICd7c3BhY2V9JzpcclxuICAgICAgICB0aGlzLmhhbmRsZVNwYWNlUHJlc3MocG9zLCBwb3NFbmQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3tsYW5nfSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVMYW5nc3dpdGNoKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVEZWZhdWx0S2V5UHJlc3MoYnV0dG9uLCBwb3MsIHBvc0VuZCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJ1dHRvbiAhPT0gJ3tzaGlmdH0nKSB7XHJcbiAgICAgIHRoaXMuZGlzYWJsZVNoaWZ0UHJlc3MoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25LZXlSZWxlYXNlKGJ1dHRvbjogc3RyaW5nKSB7XHJcbiAgICBpZiAoYnV0dG9uID09PSAne2Rvd25rZXlib2FyZH0nKSB7XHJcbiAgICAgIHRoaXMub25Gb2N1c091dCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIHByaXZhdGUgb25Nb3VzZVVwKGV2ZW50OiBNb3VzZUV2ZW50KSB7XHJcbiAgICB0aGlzLmlzTW91c2VEb3duID0gZmFsc2U7XHJcbiAgXHJcbiAgICBpZiAoIXRoaXMuaW5wdXRFbGVtZW50IHx8ICF0aGlzLmlucHV0RWxlbWVudC5jb250YWlucyhldmVudC50YXJnZXQgYXMgTm9kZSkgfHwgIXRoaXMua2V5Ym9hcmRDb250YWluZXIpIHtcclxuICAgICAvLyB0aGlzLmhpZGVLZXlib2FyZCgpO1xyXG4gICAgIC8vIHRoaXMuaGlkZUtleWJvYXJkVG9nZ2xlcigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbk1vdXNlVXBOZXcoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcclxuICAgIHRoaXMuaXNNb3VzZURvd24gPSBmYWxzZTtcclxuICBcclxuICAgIC8vIEFjY2VzcyBuYXRpdmUgZWxlbWVudHMgZnJvbSBFbGVtZW50UmVmXHJcbiAgICBjb25zdCBpbnB1dEVsZW1lbnROYXRpdmUgPSB0aGlzLmlucHV0RWxlbWVudDtcclxuICAgIGNvbnN0IGtleWJvYXJkQ29udGFpbmVyTmF0aXZlID0gdGhpcy5rZXlib2FyZENvbnRhaW5lciA/IHRoaXMua2V5Ym9hcmRDb250YWluZXIubmF0aXZlRWxlbWVudCA6IG51bGw7XHJcbiAgXHJcbiAgICAvLyBDaGVjayBpZiB0aGUgY2xpY2sgd2FzIG91dHNpZGUgYm90aCBpbnB1dEVsZW1lbnQgYW5kIGtleWJvYXJkQ29udGFpbmVyXHJcbiAgICBpZiAoIWlucHV0RWxlbWVudE5hdGl2ZSB8fCAhaW5wdXRFbGVtZW50TmF0aXZlLmNvbnRhaW5zKGV2ZW50LnRhcmdldCBhcyBOb2RlKSkge1xyXG4gICAgICBpZiAoIWtleWJvYXJkQ29udGFpbmVyTmF0aXZlIHx8ICFrZXlib2FyZENvbnRhaW5lck5hdGl2ZS5jb250YWlucyhldmVudC50YXJnZXQgYXMgTm9kZSkpIHtcclxuICAgICAgICAvL3RoaXMuaGlkZUtleWJvYXJkKCk7XHJcbiAgICAgICAvLyB0aGlzLmhpZGVLZXlib2FyZFRvZ2dsZXIoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIHByaXZhdGUgb25LZXlQcmVzc051bWVyaWMoYnV0dG9uOiBzdHJpbmcpIHtcclxuICAgIGlmICghWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksICd7YmtzcH0nXS5zb21lKHggPT4gU3RyaW5nKHgpID09PSBidXR0b24pKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChidXR0b24gPT09ICd7YmtzcH0nKSB7XHJcbiAgICAgIGNvbnN0IHN0clZhbHVlID0gU3RyaW5nKHRoaXMuaW5wdXRFbGVtZW50IS52YWx1ZSk7XHJcbiAgICAgIGlmIChzdHJWYWx1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5pbnB1dEVsZW1lbnQhLnZhbHVlID0gc3RyVmFsdWUuc3Vic3RyaW5nKDAsIHN0clZhbHVlLmxlbmd0aCAtIDEpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmlucHV0RWxlbWVudCEudmFsdWUgKz0gYnV0dG9uO1xyXG4gICAgfVxyXG4gICAgdGhpcy5wZXJmb3JtTmF0aXZlS2V5UHJlc3ModGhpcy5pbnB1dEVsZW1lbnQhLCBidXR0b24uY2hhckNvZGVBdCgwKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUVudGVyUHJlc3MocG9zOiBudW1iZXIgfCBudWxsLCBwb3NFbmQ6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmICh0aGlzLmlucHV0RWxlbWVudCEudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAndGV4dGFyZWEnKSB7XHJcbiAgICAgIGNvbnN0IGJ1dHRvbiA9ICdcXG4nO1xyXG4gICAgICBpZiAocG9zICE9PSBudWxsICYmIHBvc0VuZCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMuaW5wdXRFbGVtZW50IS52YWx1ZSA9XHJcbiAgICAgICAgICB0aGlzLmlucHV0RWxlbWVudCEudmFsdWUuc3Vic3RyKDAsIHBvcykgK1xyXG4gICAgICAgICAgYnV0dG9uICtcclxuICAgICAgICAgIHRoaXMuaW5wdXRFbGVtZW50IS52YWx1ZS5zdWJzdHIocG9zRW5kKTtcclxuICAgICAgICB0aGlzLmlucHV0RWxlbWVudCEuc2VsZWN0aW9uU3RhcnQgPSBwb3MgKyAxO1xyXG4gICAgICAgIHRoaXMuaW5wdXRFbGVtZW50IS5zZWxlY3Rpb25FbmQgPSBwb3MgKyAxO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuaW5wdXRFbGVtZW50IS52YWx1ZSArPSBidXR0b247XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMucGVyZm9ybU5hdGl2ZUtleVByZXNzKHRoaXMuaW5wdXRFbGVtZW50ISwgMTMpO1xyXG4gIH1cclxuXHJcblxyXG5cclxuICBwcml2YXRlIGhhbmRsZUxhbmdzd2l0Y2goKSB7XHJcbiAgdGhpcy5kZWZhdWx0TGFuZ3VhZ2UgPSB0aGlzLmRlZmF1bHRMYW5ndWFnZSA9PT0gdGhpcy5zZWNvbmRMYW5ndWFnZVxyXG4gID8gdGhpcy5vcmlnaW5hbERlZmF1bHRMYW5ndWFnZSBcclxuICA6IHRoaXMuc2Vjb25kTGFuZ3VhZ2U7IFxyXG4gIHRoaXMuc3dpdGNoTGFuZ3VhZ2UodGhpcy5kZWZhdWx0TGFuZ3VhZ2UpO1xyXG4gIH1cclxuICBcclxuICBcclxuXHJcblxyXG4gIHByaXZhdGUgaGFuZGxlQmFja3NwYWNlUHJlc3MocG9zOiBudW1iZXIgfCBudWxsLCBwb3NFbmQ6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmICghdGhpcy5pbnB1dEVsZW1lbnQgfHwgcG9zID09PSBudWxsIHx8IHBvc0VuZCA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gIFxyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmlucHV0RWxlbWVudC52YWx1ZTtcclxuICBcclxuICAgIGlmIChwb3MgPT09IHBvc0VuZCkge1xyXG4gICAgICAvLyBJZiB0aGVyZSdzIG5vIHNlbGVjdGlvbiwgZGVsZXRlIG9uZSBjaGFyYWN0ZXIgYmVmb3JlIHRoZSBjdXJzb3JcclxuICAgICAgaWYgKHBvcyA+IDApIHtcclxuICAgICAgICBjb25zdCBiZWZvcmUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgcG9zIC0gMSk7XHJcbiAgICAgICAgY29uc3QgYWZ0ZXIgPSB2YWx1ZS5zdWJzdHJpbmcocG9zKTtcclxuICAgICAgICB0aGlzLmlucHV0RWxlbWVudC52YWx1ZSA9IGJlZm9yZSArIGFmdGVyO1xyXG4gIFxyXG4gICAgICAgIC8vIE1vdmUgdGhlIGN1cnNvciBvbmUgcG9zaXRpb24gYmFja1xyXG4gICAgICAgIGNvbnN0IG5ld1BvcyA9IHBvcyAtIDE7XHJcbiAgICAgICAgdGhpcy5pbnB1dEVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UobmV3UG9zLCBuZXdQb3MpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBJZiB0aGVyZSdzIGEgc2VsZWN0aW9uLCBkZWxldGUgdGhlIHNlbGVjdGVkIHJhbmdlIG9mIHRleHRcclxuICAgICAgY29uc3QgYmVmb3JlID0gdmFsdWUuc3Vic3RyaW5nKDAsIHBvcyk7XHJcbiAgICAgIGNvbnN0IGFmdGVyID0gdmFsdWUuc3Vic3RyaW5nKHBvc0VuZCk7XHJcbiAgICAgIHRoaXMuaW5wdXRFbGVtZW50LnZhbHVlID0gYmVmb3JlICsgYWZ0ZXI7XHJcbiAgXHJcbiAgICAgIC8vIFNldCB0aGUgY3Vyc29yIHRvIHRoZSBzdGFydCBvZiB0aGUgZGVsZXRpb25cclxuICAgICAgdGhpcy5pbnB1dEVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UocG9zLCBwb3MpO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgLy8gUmVmb2N1cyB0aGUgaW5wdXQgZWxlbWVudCB0byBlbnN1cmUgaXQgc3RheXMgZm9jdXNlZFxyXG4gICAgdGhpcy5pbnB1dEVsZW1lbnQuZm9jdXMoKTtcclxuICB9XHJcbiAgXHJcblxyXG4gIHByaXZhdGUgaGFuZGxlVGFiUHJlc3MoKSB7XHJcbiAgICBjb25zdCBpbnB1dExpc3QgPSBBcnJheS5mcm9tKHRoaXMuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnF1ZXJ5U2VsZWN0b3IpKTtcclxuICAgIGNvbnN0IGluZGV4ID0gaW5wdXRMaXN0LmluZGV4T2YodGhpcy5pbnB1dEVsZW1lbnQhKTtcclxuICAgIChpbnB1dExpc3RbKGluZGV4ICsgMSkgJSBpbnB1dExpc3QubGVuZ3RoXSBhcyBIVE1MRWxlbWVudCkuZm9jdXMoKTtcclxuICB9XHJcblxyXG5cclxuICBwcml2YXRlIGhhbmRsZVNwYWNlUHJlc3MocG9zOiBudW1iZXIgfCBudWxsLCBwb3NFbmQ6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmICghdGhpcy5pbnB1dEVsZW1lbnQgfHwgcG9zID09PSBudWxsIHx8IHBvc0VuZCA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gIFxyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmlucHV0RWxlbWVudC52YWx1ZTtcclxuICBcclxuICAgIGlmIChwb3MgPT09IHBvc0VuZCkge1xyXG4gICAgICAvLyBJZiB0aGVyZSdzIG5vIHNlbGVjdGlvbiwgaW5zZXJ0IGEgc3BhY2UgYXQgdGhlIGN1cnNvciBwb3NpdGlvblxyXG4gICAgICBjb25zdCBiZWZvcmUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgcG9zKTtcclxuICAgICAgY29uc3QgYWZ0ZXIgPSB2YWx1ZS5zdWJzdHJpbmcocG9zKTtcclxuICAgICAgdGhpcy5pbnB1dEVsZW1lbnQudmFsdWUgPSBiZWZvcmUgKyAnICcgKyBhZnRlcjtcclxuICBcclxuICAgICAgLy8gTW92ZSB0aGUgY3Vyc29yIG9uZSBwb3NpdGlvbiB0byB0aGUgcmlnaHRcclxuICAgICAgY29uc3QgbmV3UG9zID0gcG9zICsgMTtcclxuICAgICAgdGhpcy5pbnB1dEVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UobmV3UG9zLCBuZXdQb3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gSWYgdGhlcmUncyBhIHNlbGVjdGlvbiwgcmVwbGFjZSB0aGUgc2VsZWN0ZWQgdGV4dCB3aXRoIGEgc3BhY2VcclxuICAgICAgY29uc3QgYmVmb3JlID0gdmFsdWUuc3Vic3RyaW5nKDAsIHBvcyk7XHJcbiAgICAgIGNvbnN0IGFmdGVyID0gdmFsdWUuc3Vic3RyaW5nKHBvc0VuZCk7XHJcbiAgICAgIHRoaXMuaW5wdXRFbGVtZW50LnZhbHVlID0gYmVmb3JlICsgJyAnICsgYWZ0ZXI7XHJcbiAgXHJcbiAgICAgIC8vIFNldCB0aGUgY3Vyc29yIHRvIHRoZSBwb3NpdGlvbiBhZnRlciB0aGUgaW5zZXJ0ZWQgc3BhY2VcclxuICAgICAgdGhpcy5pbnB1dEVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UocG9zICsgMSwgcG9zICsgMSk7XHJcbiAgICB9XHJcbiAgXHJcbiAgICAvLyBSZWZvY3VzIHRoZSBpbnB1dCBlbGVtZW50IHRvIGVuc3VyZSBpdCBzdGF5cyBmb2N1c2VkXHJcbiAgICB0aGlzLmlucHV0RWxlbWVudC5mb2N1cygpO1xyXG4gIH1cclxuICBcclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVEZWZhdWx0S2V5UHJlc3MoYnV0dG9uOiBzdHJpbmcsIHBvczogbnVtYmVyIHwgbnVsbCwgcG9zRW5kOiBudW1iZXIgfCBudWxsKSB7XHJcbiAgICBpZiAoIXRoaXMuaW5wdXRFbGVtZW50IHx8IHBvcyA9PT0gbnVsbCB8fCBwb3NFbmQgPT09IG51bGwpIHJldHVybjtcclxuICBcclxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5pbnB1dEVsZW1lbnQudmFsdWU7XHJcbiAgXHJcbiAgICAvLyBJbnNlcnQgdGhlIGJ1dHRvbiBhdCB0aGUgY3Vyc29yIHBvc2l0aW9uXHJcbiAgICBjb25zdCBiZWZvcmUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgcG9zKTtcclxuICAgIGNvbnN0IGFmdGVyID0gdmFsdWUuc3Vic3RyaW5nKHBvc0VuZCk7XHJcbiAgXHJcbiAgICAvLyBVcGRhdGUgdGhlIGlucHV0IHZhbHVlIHdpdGggdGhlIG5ldyBjaGFyYWN0ZXJcclxuICAgIHRoaXMuaW5wdXRFbGVtZW50LnZhbHVlID0gYmVmb3JlICsgYnV0dG9uICsgYWZ0ZXI7XHJcbiAgXHJcbiAgICAvLyBVcGRhdGUgdGhlIGN1cnNvciBwb3NpdGlvbiBleHBsaWNpdGx5IHRvIHByZXZlbnQgcmVzZXRcclxuICAgIGNvbnN0IG5ld1BvcyA9IHBvcyArIGJ1dHRvbi5sZW5ndGg7XHJcbiAgICBcclxuICAgIC8vY29uc29sZS5sb2coYEN1cnNvciBwb3NpdGlvbiBiZWZvcmU6ICR7cG9zfSwgYWZ0ZXI6ICR7bmV3UG9zfWApO1xyXG4gIFxyXG4gICAgLy8gU2V0IHRoZSBuZXcgY3Vyc29yIHBvc2l0aW9uXHJcbiAgICB0aGlzLmlucHV0RWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShuZXdQb3MsIG5ld1Bvcyk7XHJcbiAgXHJcbiAgICAvLyBSZWZvY3VzIHRoZSBpbnB1dCBlbGVtZW50IHRvIHByZXZlbnQgbG9zaW5nIGZvY3VzXHJcbiAgICB0aGlzLmlucHV0RWxlbWVudC5mb2N1cygpO1xyXG4gIH1cclxuICBcclxuXHJcbiAgcHJpdmF0ZSBwZXJmb3JtTmF0aXZlS2V5UHJlc3MoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleUNvZGU6IG51bWJlcikge1xyXG4gICAgY29uc3Qga2V5ZG93bkV2ZW50ID0gbmV3IEtleWJvYXJkRXZlbnQoJ2tleWRvd24nLCB7IGtleUNvZGU6IGtleUNvZGUsIHdoaWNoOiBrZXlDb2RlIH0pO1xyXG4gICAgY29uc3Qga2V5cHJlc3NFdmVudCA9IG5ldyBLZXlib2FyZEV2ZW50KCdrZXlwcmVzcycsIHsga2V5Q29kZToga2V5Q29kZSwgd2hpY2g6IGtleUNvZGUgfSk7XHJcbiAgICBjb25zdCBpbnB1dEV2ZW50ID0gbmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSB9KTtcclxuICAgIFxyXG4gICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGtleWRvd25FdmVudCk7XHJcbiAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoa2V5cHJlc3NFdmVudCk7XHJcbiAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoaW5wdXRFdmVudCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uRm9jdXMxKHRhcmdldDogSFRNTElucHV0RWxlbWVudCkge1xyXG4gICAgdGhpcy5pbnB1dEVsZW1lbnQgPSB0YXJnZXQ7XHJcbiAgICBpZiAodGFyZ2V0LnR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgdGhpcy5rZXlib2FyZC5zZXRPcHRpb25zKHtcclxuICAgICAgICBsYXlvdXQ6IHRoaXMubnVtZXJpY0xheW91dCxcclxuICAgICAgICBsYXlvdXROYW1lOiAnZGVmYXVsdCcsXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5rZXlib2FyZC5zZXRPcHRpb25zKHtcclxuICAgICAgICAuLi50aGlzLmxhbmd1YWdlTGF5b3V0LFxyXG4gICAgICAgIGxheW91dE5hbWU6ICdkZWZhdWx0JyxcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaW5wdXRFbGVtZW50Lm1hdGNoZXMoJy5uby1rZXlib2FyZCcpKSB7XHJcbiAgICAgIHRoaXMuc2hvd0tleWJvYXJkVG9nZ2xlcigpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5oaWRlS2V5Ym9hcmRUb2dnbGVyKCk7XHJcbiAgICB0aGlzLnNob3dLZXlib2FyZCgpO1xyXG4gICAgXHJcbiAgICBjb25zdCBvZmZzZXQgPSA1MDtcclxuICAgIGNvbnN0IGJvZHlSZWN0ID0gdGhpcy5kb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgIGNvbnN0IGVsZW1lbnRSZWN0ID0gdGhpcy5pbnB1dEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG4gICAgY29uc3QgZWxlbWVudFBvc2l0aW9uID0gZWxlbWVudFJlY3QgLSBib2R5UmVjdDtcclxuICAgIGNvbnN0IG9mZnNldFBvc2l0aW9uID0gZWxlbWVudFBvc2l0aW9uIC0gb2Zmc2V0O1xyXG4gICAgd2luZG93LnNjcm9sbFRvKHsgdG9wOiBvZmZzZXRQb3NpdGlvbiwgYmVoYXZpb3I6ICdzbW9vdGgnIH0pO1xyXG4gIH1cclxuXHJcblxyXG4gIHByaXZhdGUgb25Gb2N1cyh0YXJnZXQ6IEhUTUxJbnB1dEVsZW1lbnQpIHtcclxuICB0aGlzLmlucHV0RWxlbWVudCA9IHRhcmdldDtcclxuXHJcbiAgLy8gQ2hlY2sgaWYgdGhlIHRhcmdldCBpcyBhIHRleHQgaW5wdXQsIG51bWJlciBpbnB1dCwgb3IgdGV4dGFyZWFcclxuICBpZiAodGFyZ2V0LnR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ3RleHQnIHx8IHRhcmdldC50eXBlLnRvTG93ZXJDYXNlKCkgPT09ICdudW1iZXInIHx8IHRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICd0ZXh0YXJlYScpIHtcclxuICAgIGlmICh0YXJnZXQudHlwZS50b0xvd2VyQ2FzZSgpID09PSAnbnVtYmVyJykge1xyXG4gICAgICB0aGlzLmtleWJvYXJkLnNldE9wdGlvbnMoe1xyXG4gICAgICAgIGxheW91dDogdGhpcy5udW1lcmljTGF5b3V0LFxyXG4gICAgICAgIGxheW91dE5hbWU6ICdkZWZhdWx0JyxcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmtleWJvYXJkLnNldE9wdGlvbnMoe1xyXG4gICAgICAgIC4uLnRoaXMubGFuZ3VhZ2VMYXlvdXQsXHJcbiAgICAgICAgbGF5b3V0TmFtZTogJ2RlZmF1bHQnLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaG93IGtleWJvYXJkIGFuZCBoYW5kbGUgc2Nyb2xsaW5nXHJcbiAgICB0aGlzLmhpZGVLZXlib2FyZFRvZ2dsZXIoKTtcclxuICAgIHRoaXMuc2hvd0tleWJvYXJkKCk7XHJcblxyXG4gICAgY29uc3Qgb2Zmc2V0ID0gNTA7XHJcbiAgICBjb25zdCBib2R5UmVjdCA9IHRoaXMuZG9jdW1lbnQuYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICBjb25zdCBlbGVtZW50UmVjdCA9IHRoaXMuaW5wdXRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgIGNvbnN0IGVsZW1lbnRQb3NpdGlvbiA9IGVsZW1lbnRSZWN0IC0gYm9keVJlY3Q7XHJcbiAgICBjb25zdCBvZmZzZXRQb3NpdGlvbiA9IGVsZW1lbnRQb3NpdGlvbiAtIG9mZnNldDtcclxuICAgIHdpbmRvdy5zY3JvbGxUbyh7IHRvcDogb2Zmc2V0UG9zaXRpb24sIGJlaGF2aW9yOiAnc21vb3RoJyB9KTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5oaWRlS2V5Ym9hcmQoKTtcclxuICAgIHRoaXMuaGlkZUtleWJvYXJkVG9nZ2xlcigpO1xyXG4gIH1cclxufVxyXG5cclxuICBwcml2YXRlIHNob3dLZXlib2FyZFRvZ2dsZXIoKSB7XHJcbiAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMua2V5Ym9hcmRUb2dnbGVyLm5hdGl2ZUVsZW1lbnQsICdoaWRkZW4nKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGlkZUtleWJvYXJkVG9nZ2xlcigpIHtcclxuICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5rZXlib2FyZFRvZ2dsZXIubmF0aXZlRWxlbWVudCwgJ2hpZGRlbicpO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlS2V5Ym9hcmQoKSB7XHJcbiAgICBpZiAodGhpcy5rZXlib2FyZENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPT09ICdub25lJykge1xyXG4gICAgICB0aGlzLnNob3dLZXlib2FyZCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkZvY3VzT3V0KCkge1xyXG4gICAgaWYgKHRoaXMuaW5wdXRFbGVtZW50KSB7XHJcbiAgICAgIHRoaXMuaW5wdXRFbGVtZW50LmJsdXIoKTtcclxuICAgICAgdGhpcy5pbnB1dEVsZW1lbnQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgdGhpcy5oaWRlS2V5Ym9hcmQoKTtcclxuICAgIHRoaXMuaGlkZUtleWJvYXJkVG9nZ2xlcigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93S2V5Ym9hcmQoKSB7XHJcbiAgICBjb25zdCBkaWFsb2dzID0gdGhpcy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZml4ZWQtZnVsbCcpO1xyXG4gICAgaWYgKHRoaXMua2V5Ym9hcmRIaWRlVGFzayAhPSBudWxsKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmtleWJvYXJkSGlkZVRhc2spO1xyXG4gICAgICB0aGlzLmtleWJvYXJkSGlkZVRhc2sgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmtleWJvYXJkQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQsICdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICBjb25zdCBrZXlib2FyZEhlaWdodCA9IHRoaXMua2V5Ym9hcmRDb250YWluZXIubmF0aXZlRWxlbWVudC5vZmZzZXRIZWlnaHQ7XHJcbiAgICBcclxuICAgIGNvbnN0IHN0eWxlID0gYHBhZGRpbmctYm90dG9tOiAke2tleWJvYXJkSGVpZ2h0fXB4ICFpbXBvcnRhbnRgO1xyXG4gICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUodGhpcy5kb2N1bWVudC5ib2R5LCAnc3R5bGUnLCBzdHlsZSk7XHJcbiAgICBkaWFsb2dzLmZvckVhY2goZGlhbG9nID0+IHRoaXMucmVuZGVyZXIuc2V0QXR0cmlidXRlKGRpYWxvZywgJ3N0eWxlJywgc3R5bGUpKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY2hlY2tLZXlib2FyZCgpIHtcclxuICAgIGlmICh0aGlzLmlzTW91c2VEb3duKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSB0aGlzLmRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgIGlmIChhY3RpdmVFbGVtZW50Lm1hdGNoZXModGhpcy5xdWVyeVNlbGVjdG9yKSkge1xyXG4gICAgICBpZiAodGhpcy5pbnB1dEVsZW1lbnQgIT09IGFjdGl2ZUVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLm9uRm9jdXMoYWN0aXZlRWxlbWVudCk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmlucHV0RWxlbWVudCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMub25Gb2N1c091dCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhpZGVLZXlib2FyZCgpIHtcclxuICAgIHRoaXMua2V5Ym9hcmRIaWRlVGFzayA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBjb25zdCBkaWFsb2dzID0gdGhpcy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZml4ZWQtZnVsbCcpO1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLnNldFN0eWxlKHRoaXMua2V5Ym9hcmRDb250YWluZXIubmF0aXZlRWxlbWVudCwgJ2Rpc3BsYXknLCAnbm9uZScpO1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLmRvY3VtZW50LmJvZHksICdzdHlsZScpO1xyXG4gICAgICB0aGlzLmtleWJvYXJkSGlkZVRhc2sgPSBudWxsO1xyXG4gICAgICBkaWFsb2dzLmZvckVhY2goZGlhbG9nID0+IHRoaXMucmVuZGVyZXIucmVtb3ZlQXR0cmlidXRlKGRpYWxvZywgJ3N0eWxlJykpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZVNoaWZ0UHJlc3MoKSB7XHJcbiAgICB0aGlzLnNoaWZ0UHJlc3NlZCA9ICF0aGlzLnNoaWZ0UHJlc3NlZDtcclxuICAgIHRoaXMudG9nZ2xlU2hpZnRMYXlvdXQoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlQ2Fwc0xvY2tQcmVzc2VkKCkge1xyXG4gICAgdGhpcy50b2dnbGVTaGlmdExheW91dCgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkaXNhYmxlU2hpZnRQcmVzcygpIHtcclxuICAgIGlmICghdGhpcy5zaGlmdFByZXNzZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5zaGlmdFByZXNzZWQgPSBmYWxzZTtcclxuICAgIHRoaXMudG9nZ2xlU2hpZnRMYXlvdXQoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdG9nZ2xlU2hpZnRMYXlvdXQoKSB7XHJcbiAgICBjb25zdCBjdXJyZW50TGF5b3V0ID0gdGhpcy5rZXlib2FyZC5vcHRpb25zLmxheW91dE5hbWU7XHJcbiAgICBjb25zdCBzaGlmdFRvZ2dsZSA9IGN1cnJlbnRMYXlvdXQgPT09ICdkZWZhdWx0JyA/ICdzaGlmdCcgOiAnZGVmYXVsdCc7XHJcbiAgICB0aGlzLmtleWJvYXJkLnNldE9wdGlvbnMoe1xyXG4gICAgICBsYXlvdXROYW1lOiBzaGlmdFRvZ2dsZSxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbn1cclxuIl19