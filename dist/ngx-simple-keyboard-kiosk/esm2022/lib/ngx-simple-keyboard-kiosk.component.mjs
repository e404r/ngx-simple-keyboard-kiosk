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
        keyRowsDefault[keyRowsDefault.length - 1] += ' {lang}';
        const keyRowsShift = this.languageLayout.layout.shift;
        // keyRowsShift[keyRowsShift.length - 1] += ' {downkeyboard}';
        keyRowsShift[keyRowsShift.length - 1] += ' {lang}';
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
                '{downkeyboard}': '\u25BC',
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
            //if (!row.includes('{downkeyboard}')) row += ' {downkeyboard}';
            if (!row.includes('{lang}'))
                row += ' {lang}';
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
                    '{downkeyboard}': '\u25BC',
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
                    '{downkeyboard}': '\u25BC',
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
    //private setLanguageLayout(language: 'english' | 'georgian') {
    //  this.languageLayout = language === 'english' ? englishLayout : georgianlayout;
    //
    //  this.languageChange.emit(language);
    //}
    setLanguageLayout(language) {
        // Set the language layout based on the selected language
        this.languageLayout = language === 'english' ? englishLayout : georgianlayout;
        // Safely access the default and shift layouts
        const keyRowsDefault = this.languageLayout?.default || [];
        const keyRowsShift = this.languageLayout?.shift || [];
        // Function to add {downkeyboard} and {lang} if not present
        const addSpecialButtons = (row) => {
            if (!row.includes('{downkeyboard}')) {
                row += ' {downkeyboard}';
            }
            if (!row.includes('{lang}')) {
                row += ' {lang}';
            }
            return row;
        };
        // Modify the last row of the default layout
        if (keyRowsDefault.length > 0) {
            keyRowsDefault[keyRowsDefault.length - 1] = addSpecialButtons(keyRowsDefault[keyRowsDefault.length - 1]);
        }
        // Modify the last row of the shift layout
        if (keyRowsShift.length > 0) {
            keyRowsShift[keyRowsShift.length - 1] = addSpecialButtons(keyRowsShift[keyRowsShift.length - 1]);
        }
        // Emit the language change event
        this.languageChange.emit(language);
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
                this.hideKeyboard();
                this.hideKeyboardToggler();
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
    handleLangswitchDEF() {
        this.defaultLanguage = this.defaultLanguage === 'english' ? 'georgian' : 'english';
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
        // Log the cursor position to debug
        //  console.log(`Cursor position before: ${pos}, after: ${newPos}`);
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
  `, isInline: true, styles: ["#virtual-keyboard{top:unset;bottom:0;border-radius:10px 10px 0 0;box-sizing:border-box!important;position:fixed;z-index:20000;width:100%;max-width:1440px;background:#e3e3e3;background:linear-gradient(to right bottom,#eee,#ebebeb,#e8e8e8,#e6e6e6,#e3e3e3);-webkit-box-shadow:inset 1px 1px 0 rgba(255,255,255,.25),0 0 20px -8px rgba(0,0,0,.15);box-shadow:inset 1px 1px #ffffff40,0 0 20px -8px #00000026;left:0;right:0;margin:auto}#virtual-keyboard .keyboard-wrapper{position:relative;background:inherit;width:100%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;box-sizing:border-box!important}.hg-button-lang{width:200px;height:200px}\n"] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.12", ngImport: i0, type: NgxSimpleKeyboardKioskComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-simple-keyboard-kiosk', template: `
<div id="virtual-keyboard" >

 <div #keyboardContainer>
 
      <div #keyboardToggler id="keyboard-toggler" class="keyboard-wrapper simple-keyboard" (click)="toggleKeyboard()"></div>
    </div>
</div>
  `, styles: ["#virtual-keyboard{top:unset;bottom:0;border-radius:10px 10px 0 0;box-sizing:border-box!important;position:fixed;z-index:20000;width:100%;max-width:1440px;background:#e3e3e3;background:linear-gradient(to right bottom,#eee,#ebebeb,#e8e8e8,#e6e6e6,#e3e3e3);-webkit-box-shadow:inset 1px 1px 0 rgba(255,255,255,.25),0 0 20px -8px rgba(0,0,0,.15);box-shadow:inset 1px 1px #ffffff40,0 0 20px -8px #00000026;left:0;right:0;margin:auto}#virtual-keyboard .keyboard-wrapper{position:relative;background:inherit;width:100%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-webkit-flex-direction:row;-ms-flex-direction:row;flex-direction:row;box-sizing:border-box!important}.hg-button-lang{width:200px;height:200px}\n"] }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXNpbXBsZS1rZXlib2FyZC1raW9zay5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9uZ3gtc2ltcGxlLWtleWJvYXJkLWtpb3NrL3NyYy9saWIvbmd4LXNpbXBsZS1rZXlib2FyZC1raW9zay5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBc0IsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFhLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6SCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDM0MsT0FBTyxRQUE2QixNQUFNLGlCQUFpQixDQUFDO0FBQzVELE9BQU8scUJBQXFCLE1BQU8seUJBQXlCLENBQUM7QUFDN0QsT0FBTyxhQUFhLE1BQU0sK0NBQStDLENBQUM7QUFDMUUsT0FBTyxjQUFjLE1BQU0sZ0RBQWdELENBQUM7OztBQXNCNUUsTUFBTSxPQUFPLCtCQUErQjtJQXFDMUMsWUFDVSxRQUFtQixFQUNuQixLQUFxQixFQUNILFFBQWtCO1FBRnBDLGFBQVEsR0FBUixRQUFRLENBQVc7UUFDbkIsVUFBSyxHQUFMLEtBQUssQ0FBZ0I7UUFDSCxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBckJwQyxtQkFBYyxHQUFHLElBQUksWUFBWSxFQUFVLENBQUM7UUFHOUMsaUJBQVksR0FBNEIsSUFBSSxDQUFDO1FBQzdDLGlCQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLG1CQUFjLEdBQVEsYUFBYSxDQUFDO1FBQ3BDLG9CQUFlLEdBQVEsYUFBYSxDQUFDO1FBR3JDLHFCQUFnQixHQUFRLElBQUksQ0FBQztRQUVwQixrQkFBYSxHQUFHO1lBQy9CLE9BQU8sRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLCtCQUErQixD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QkFBbEUsU0FBUzt1QkFBQyxtQkFBbUIsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7Z0JBQ0EsZUFBZTtzQkFBOUQsU0FBUzt1QkFBQyxpQkFBaUIsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7Z0JBRXJDLGVBQWU7c0JBQXZCLEtBQUs7Z0JBQ0csY0FBYztzQkFBdEIsS0FBSztnQkFDRyxRQUFRO3NCQUFoQixLQUFLO2dCQUlJLGNBQWM7c0JBQXZCLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIE9uSW5pdCwgRWxlbWVudFJlZiwgVmlld0NoaWxkLCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIsIFJlbmRlcmVyMiwgSW5qZWN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IERPQ1VNRU5UIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IEtleWJvYXJkLCB7IEtleWJvYXJkRWxlbWVudCB9IGZyb20gJ3NpbXBsZS1rZXlib2FyZCc7XHJcbmltcG9ydCBTaW1wbGVLZXlib2FyZExheW91dHMgIGZyb20gXCJzaW1wbGUta2V5Ym9hcmQtbGF5b3V0c1wiO1xyXG5pbXBvcnQgZW5nbGlzaExheW91dCBmcm9tIFwic2ltcGxlLWtleWJvYXJkLWxheW91dHMvYnVpbGQvbGF5b3V0cy9lbmdsaXNoXCI7XHJcbmltcG9ydCBnZW9yZ2lhbmxheW91dCBmcm9tIFwic2ltcGxlLWtleWJvYXJkLWxheW91dHMvYnVpbGQvbGF5b3V0cy9nZW9yZ2lhblwiO1xyXG5cclxuaW1wb3J0IHsgQ291bnRyeVNlcnZpY2UgfSBmcm9tICcuL2NvdW50cnkuc2VydmljZSc7XHJcblxyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICduZ3gtc2ltcGxlLWtleWJvYXJkLWtpb3NrJyxcclxuXHJcblxyXG5cclxuICB0ZW1wbGF0ZTogYFxyXG48ZGl2IGlkPVwidmlydHVhbC1rZXlib2FyZFwiID5cclxuXHJcbiA8ZGl2ICNrZXlib2FyZENvbnRhaW5lcj5cclxuIFxyXG4gICAgICA8ZGl2ICNrZXlib2FyZFRvZ2dsZXIgaWQ9XCJrZXlib2FyZC10b2dnbGVyXCIgY2xhc3M9XCJrZXlib2FyZC13cmFwcGVyIHNpbXBsZS1rZXlib2FyZFwiIChjbGljayk9XCJ0b2dnbGVLZXlib2FyZCgpXCI+PC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuPC9kaXY+XHJcbiAgYCxcclxuICAgIHN0eWxlVXJsczogWyduZ3gtc2ltcGxlLWtleWJvYXJkLWtpb3NrLmNvbXBvbmVudC5zY3NzJ10sXHJcblxyXG59KVxyXG5leHBvcnQgY2xhc3MgTmd4U2ltcGxlS2V5Ym9hcmRLaW9za0NvbXBvbmVudCAgaW1wbGVtZW50cyBPbkluaXQge1xyXG5cclxuXHJcbiAgXHJcblxyXG4gIFxyXG5cclxuXHJcblxyXG5cclxuICBAVmlld0NoaWxkKCdrZXlib2FyZENvbnRhaW5lcicsIHsgc3RhdGljOiB0cnVlIH0pIGtleWJvYXJkQ29udGFpbmVyITogRWxlbWVudFJlZjtcclxuICBAVmlld0NoaWxkKCdrZXlib2FyZFRvZ2dsZXInLCB7IHN0YXRpYzogdHJ1ZSB9KSBrZXlib2FyZFRvZ2dsZXIhOiBFbGVtZW50UmVmO1xyXG4gIC8vQElucHV0KCkgZGVmYXVsdExhbmd1YWdlOiAnZW5nbGlzaCcgfCAnZ2VybWFuJyA9ICdlbmdsaXNoJztcclxuICBASW5wdXQoKSBkZWZhdWx0TGFuZ3VhZ2UhOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgc2Vjb25kTGFuZ3VhZ2UhOiBzdHJpbmc7XHJcbiAgQElucHV0KCkgcmVtb3Zla3MhOmFueVtdXHJcbiAgcHJpdmF0ZSBvcmlnaW5hbERlZmF1bHRMYW5ndWFnZSE6IHN0cmluZztcclxuXHJcblxyXG4gIEBPdXRwdXQoKSBsYW5ndWFnZUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nPigpO1xyXG5cclxuICBwcml2YXRlIGtleWJvYXJkOmFueVxyXG4gIHByaXZhdGUgaW5wdXRFbGVtZW50OiBIVE1MSW5wdXRFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBzaGlmdFByZXNzZWQgPSBmYWxzZTtcclxuICBwcml2YXRlIGlzTW91c2VEb3duID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBsYW5ndWFnZUxheW91dDogYW55ID0gZW5nbGlzaExheW91dDtcclxuICBwcml2YXRlIGxhbmd1YWdlTGF5b3V0czogYW55ID0gZW5nbGlzaExheW91dDtcclxuICBwcml2YXRlIGZsYWdVcmw6YW55XHJcblxyXG4gIHByaXZhdGUga2V5Ym9hcmRIaWRlVGFzazogYW55ID0gbnVsbDtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBudW1lcmljTGF5b3V0ID0ge1xyXG4gICAgZGVmYXVsdDogWycxIDIgMycsICc0IDUgNicsICc3IDggOScsICd7dGFifSAwIHtia3NwfSB7ZG93bmtleWJvYXJkfSddLFxyXG4gIH07XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcXVlcnlTZWxlY3RvciA9ICdpbnB1dDpub3QoW3JlYWRvbmx5XSksIHRleHRhcmVhOm5vdChbcmVhZG9ubHldKSc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSByZW5kZXJlcjogUmVuZGVyZXIyLFxyXG4gICAgcHJpdmF0ZSBmbGFnczogQ291bnRyeVNlcnZpY2UsXHJcbiAgICBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIGRvY3VtZW50OiBEb2N1bWVudCxcclxuXHJcbiAgKSB7XHJcblxyXG5cclxuXHJcbiAgfVxyXG5cclxuICBuZ09uSW5pdCgpIHtcclxuXHJcblxyXG5cclxuXHJcbiAgICBcclxuICBcclxuXHJcbiAgICB0aGlzLm9yaWdpbmFsRGVmYXVsdExhbmd1YWdlID0gdGhpcy5kZWZhdWx0TGFuZ3VhZ2U7IC8vIFN0b3JlIHRoZSBvcmlnaW5hbCBkZWZhdWx0IGxhbmd1YWdlXHJcblxyXG4gICAgXHJcbiAgICB0aGlzLnNldHVwS2V5Ym9hcmQoKTtcclxuICAgIHRoaXMuc2V0dXBFdmVudExpc3RlbmVycygpO1xyXG4gICAgICAgIHRoaXMua2V5Ym9hcmRDb250YWluZXIubmF0aXZlRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyAgLy8gSW5pdGlhbGx5IGhpZGUgdGhlIGtleWJvYXJkXHJcbiAgICAgICAgIH1cclxuXHJcblxyXG5cclxucHJpdmF0ZSBzZXR1cEtleWJvYXJkKCkge1xyXG4gIC8vIEluaXRpYWxpemUgYXZhaWxhYmxlIGxheW91dHNcclxuICBsZXQgbGF5b3V0c0luc3RhbmNlID0gbmV3IFNpbXBsZUtleWJvYXJkTGF5b3V0cygpO1xyXG4gIHRoaXMubGFuZ3VhZ2VMYXlvdXRzID0gbGF5b3V0c0luc3RhbmNlLmxheW91dHM7XHJcbiAgXHJcbiAgLy8gQXV0b21hdGljYWxseSBzZXQgbGFuZ3VhZ2UgbGF5b3V0IGJhc2VkIG9uIHRoZSBwcm92aWRlZCBsYW5ndWFnZXNcclxuICB0aGlzLmxhbmd1YWdlTGF5b3V0ID0gdGhpcy5sYW5ndWFnZUxheW91dHNbdGhpcy5kZWZhdWx0TGFuZ3VhZ2VdIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB8fCB0aGlzLmxhbmd1YWdlTGF5b3V0c1snZW5nbGlzaCddOyAvLyBGYWxsYmFjayB0byBFbmdsaXNoIGlmIG5vdCBmb3VuZFxyXG5cclxuICAgICAgICAgICAgICAgICAgIFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWNvbmRMYW5ndWFnZT09PSdlbmdsaXNoJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmxhZ1VybD10aGlzLmZsYWdzLmdldEZsYWcoJ2VuZ2xpc2gnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mbGFnVXJsPXRoaXMuZmxhZ3MuZ2V0RmxhZyh0aGlzLnNlY29uZExhbmd1YWdlKVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcblxyXG5cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuXHJcbiAgY29uc3Qga2V5Um93c0RlZmF1bHQgPSB0aGlzLmxhbmd1YWdlTGF5b3V0LmxheW91dC5kZWZhdWx0O1xyXG4gIC8va2V5Um93c0RlZmF1bHRba2V5Um93c0RlZmF1bHQubGVuZ3RoIC0gMV0gKz0gJyB7ZG93bmtleWJvYXJkfSB7bGFuZ30nO1xyXG4gIGtleVJvd3NEZWZhdWx0W2tleVJvd3NEZWZhdWx0Lmxlbmd0aCAtIDFdICs9ICcge2xhbmd9JztcclxuXHJcbiAgXHJcbiAgY29uc3Qga2V5Um93c1NoaWZ0ID0gdGhpcy5sYW5ndWFnZUxheW91dC5sYXlvdXQuc2hpZnQ7XHJcbiAvLyBrZXlSb3dzU2hpZnRba2V5Um93c1NoaWZ0Lmxlbmd0aCAtIDFdICs9ICcge2Rvd25rZXlib2FyZH0nO1xyXG4ga2V5Um93c1NoaWZ0W2tleVJvd3NTaGlmdC5sZW5ndGggLSAxXSArPSAnIHtsYW5nfSc7XHJcblxyXG5cclxuXHJcbmNvbnN0IHJlbW92ZUtleXMgPSAocm93OiBzdHJpbmcsIGtleXNUb1JlbW92ZTogc3RyaW5nW10pID0+IHtcclxuICByZXR1cm4gcm93LnNwbGl0KCcgJykuZmlsdGVyKGtleSA9PiAha2V5c1RvUmVtb3ZlLmluY2x1ZGVzKGtleSkpLmpvaW4oJyAnKTtcclxufTtcclxuXHJcbmlmICh0aGlzLnJlbW92ZWtzICYmIHRoaXMucmVtb3Zla3MubGVuZ3RoID4gMCkge1xyXG4gIGlmIChrZXlSb3dzRGVmYXVsdC5sZW5ndGggPiAwKSB7XHJcbiAgICBrZXlSb3dzRGVmYXVsdC5mb3JFYWNoKChyb3c6IGFueSwgaW5kZXg6IGFueSkgPT4ge1xyXG4gICAgICBrZXlSb3dzRGVmYXVsdFtpbmRleF0gPSByZW1vdmVLZXlzKHJvdywgdGhpcy5yZW1vdmVrcyk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGlmIChrZXlSb3dzU2hpZnQubGVuZ3RoID4gMCkge1xyXG4gICAga2V5Um93c1NoaWZ0LmZvckVhY2goKHJvdzogYW55LCBpbmRleDogYW55KSA9PiB7XHJcbiAgICAgIGtleVJvd3NTaGlmdFtpbmRleF0gPSByZW1vdmVLZXlzKHJvdywgdGhpcy5yZW1vdmVrcyk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbiAgXHJcbiAgdGhpcy5rZXlib2FyZCA9IG5ldyBLZXlib2FyZCh7XHJcbiAgICBvbkNoYW5nZTogKGlucHV0OiBzdHJpbmcpID0+IHRoaXMub25DaGFuZ2UoaW5wdXQpLFxyXG4gICAgb25LZXlQcmVzczogKGJ1dHRvbjogc3RyaW5nKSA9PiB0aGlzLm9uS2V5UHJlc3MoYnV0dG9uKSxcclxuICAgIG9uS2V5UmVsZWFzZWQ6IChidXR0b246IHN0cmluZykgPT4gdGhpcy5vbktleVJlbGVhc2UoYnV0dG9uKSxcclxuXHJcbiAgICBcclxuICAgIC4uLnRoaXMubGFuZ3VhZ2VMYXlvdXQsXHJcblxyXG4gICAgZGlzcGxheToge1xyXG4gICAgICAne3RhYn0nOiAn4oa5JyxcclxuICAgICAgJ3tia3NwfSc6ICfijKsnLFxyXG4gICAgICAne2Rvd25rZXlib2FyZH0nOiAnXFx1MjVCQycsXHJcbiAgICAgICd7c3BhY2V9JzogJyAnLFxyXG4gICAgICAne2xhbmd9JzogYCR7dGhpcy5mbGFnVXJsfWAsIFxyXG4gICAgICAne2xvY2t9JzogJ+KHqicsXHJcbiAgICAgICd7c2hpZnR9JzogJ+KHpycsXHJcbiAgICAgICd7ZW50ZXJ9JzogJ+KGtScsXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuXHJcblxyXG4gIHRoaXMuaGlkZUtleWJvYXJkKCk7XHJcbn1cclxuXHJcblxyXG4gIFxyXG5cclxuXHJcblxyXG5wcml2YXRlIHNldHVwRXZlbnRMaXN0ZW5lcnMoKSB7XHJcbiAgdGhpcy5yZW5kZXJlci5saXN0ZW4oJ3dpbmRvdycsICdmb2N1c2luJywgKGV2ZW50OiBGb2N1c0V2ZW50KSA9PiB7XHJcbiAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgIGlmICh0YXJnZXQgJiYgdGFyZ2V0Lm1hdGNoZXModGhpcy5xdWVyeVNlbGVjdG9yKSkge1xyXG4gICAgICB0aGlzLm9uRm9jdXModGFyZ2V0KTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgY29uc3QgZXZlbnRzID0gWydtb3VzZWRvd24nLCAnbW91c2V1cCcsICd0b3VjaHN0YXJ0JywgJ3RvdWNoZW5kJ107XHJcbiAgZXZlbnRzLmZvckVhY2goZXZlbnROYW1lID0+IHtcclxuICAgIHRoaXMucmVuZGVyZXIubGlzdGVuKCdib2R5JywgZXZlbnROYW1lLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XHJcbiAgICAgIGlmIChldmVudE5hbWUgPT09ICdtb3VzZXVwJykge1xyXG4gICAgICAgIHRoaXMub25Nb3VzZVVwKGV2ZW50IGFzIE1vdXNlRXZlbnQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodGhpcy5pc0NoaWxkRWxlbWVudChldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQsIHRoaXMua2V5Ym9hcmRDb250YWluZXIubmF0aXZlRWxlbWVudCkpIHtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAgLy8gUHJldmVudHMgaW5wdXQgYmx1ciB3aGVuIGludGVyYWN0aW5nIHdpdGggdGhlIGtleWJvYXJkXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxyXG5cclxuXHJcbiAgcHJpdmF0ZSBzZXR1cEV2ZW50TGlzdGVuZXJzT0xEKCkge1xyXG4gICAgdGhpcy5yZW5kZXJlci5saXN0ZW4oJ3dpbmRvdycsICdmb2N1c2luJywgKGV2ZW50OiBGb2N1c0V2ZW50KSA9PiB7XHJcbiAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICBcclxuICAgICAgaWYgKHRhcmdldCAmJiB0YXJnZXQubWF0Y2hlcyh0aGlzLnF1ZXJ5U2VsZWN0b3IpKSB7XHJcbiAgICAgICAgdGhpcy5vbkZvY3VzKHRhcmdldCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIFxyXG4gICAgY29uc3QgZXZlbnRzID0gWydtb3VzZWRvd24nLCAnbW91c2V1cCcsICd0b3VjaHN0YXJ0JywgJ3RvdWNoZW5kJ107XHJcbiAgICBldmVudHMuZm9yRWFjaChldmVudE5hbWUgPT4ge1xyXG4gICAgICB0aGlzLnJlbmRlcmVyLmxpc3RlbignYm9keScsIGV2ZW50TmFtZSwgKGV2ZW50OiBFdmVudCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLmlzQ2hpbGRFbGVtZW50KGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudCwgdGhpcy5rZXlib2FyZENvbnRhaW5lci5uYXRpdmVFbGVtZW50KSkge1xyXG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsgIC8vIFByZXZlbnRzIGlucHV0IGJsdXIgd2hlbiBpbnRlcmFjdGluZyB3aXRoIHRoZSBrZXlib2FyZFxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgXHJcblxyXG5cclxuXHJcblxyXG4gIHByaXZhdGUgdXBkYXRlS2V5Ym9hcmRMYXlvdXQoKSB7XHJcblxyXG4gICAgY29uc3QgbGF5b3V0ID0gdGhpcy5kZWZhdWx0TGFuZ3VhZ2UgPT09ICdlbmdsaXNoJyA/IGVuZ2xpc2hMYXlvdXQgOiBnZW9yZ2lhbmxheW91dDtcclxuICAgIFxyXG5cclxuICAgIHRoaXMuc3dpdGNoTGFuZ3VhZ2UoJ2VuZ2xpc2gnKVxyXG4gIFxyXG4gIH1cclxuXHJcblxyXG4gIHN3aXRjaExhbmd1YWdlKGxhbmd1YWdlOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IGxheW91dHNJbnN0YW5jZSA9IG5ldyBTaW1wbGVLZXlib2FyZExheW91dHMoKTtcclxuICAgIHRoaXMubGFuZ3VhZ2VMYXlvdXRzID0gbGF5b3V0c0luc3RhbmNlLmxheW91dHM7XHJcbiAgXHJcbiAgICB0aGlzLmxhbmd1YWdlTGF5b3V0ID0gdGhpcy5sYW5ndWFnZUxheW91dHNbbGFuZ3VhZ2VdIHx8IHRoaXMubGFuZ3VhZ2VMYXlvdXRzWydlbmdsaXNoJ107IFxyXG4gIFxyXG4gICAgaWYgKGxhbmd1YWdlID09PSB0aGlzLm9yaWdpbmFsRGVmYXVsdExhbmd1YWdlKSB7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLmZsYWdVcmwgPSB0aGlzLmZsYWdzLmdldEZsYWcodGhpcy5zZWNvbmRMYW5ndWFnZSk7IFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5mbGFnVXJsID10aGlzLmZsYWdzLmdldEZsYWcodGhpcy5vcmlnaW5hbERlZmF1bHRMYW5ndWFnZSk7IFxyXG4gICAgfVxyXG4gIFxyXG4gICAgY29uc3Qga2V5Um93c0RlZmF1bHQgPSB0aGlzLmxhbmd1YWdlTGF5b3V0LmxheW91dC5kZWZhdWx0O1xyXG4gICAgY29uc3Qga2V5Um93c1NoaWZ0ID0gdGhpcy5sYW5ndWFnZUxheW91dC5sYXlvdXQuc2hpZnQ7XHJcbiAgXHJcblxyXG4gICAgY29uc3QgcmVtb3ZlS2V5cyA9IChyb3c6IHN0cmluZywga2V5c1RvUmVtb3ZlOiBzdHJpbmdbXSkgPT4ge1xyXG4gICAgICByZXR1cm4gcm93LnNwbGl0KCcgJykuZmlsdGVyKGtleSA9PiAha2V5c1RvUmVtb3ZlLmluY2x1ZGVzKGtleSkpLmpvaW4oJyAnKTtcclxuICAgIH07XHJcbiAgICBcclxuICAgIGlmICh0aGlzLnJlbW92ZWtzICYmIHRoaXMucmVtb3Zla3MubGVuZ3RoID4gMCkge1xyXG4gICAgICBpZiAoa2V5Um93c0RlZmF1bHQubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGtleVJvd3NEZWZhdWx0LmZvckVhY2goKHJvdzogYW55LCBpbmRleDogYW55KSA9PiB7XHJcbiAgICAgICAgICBrZXlSb3dzRGVmYXVsdFtpbmRleF0gPSByZW1vdmVLZXlzKHJvdywgdGhpcy5yZW1vdmVrcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIFxyXG4gICAgICBpZiAoa2V5Um93c1NoaWZ0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICBrZXlSb3dzU2hpZnQuZm9yRWFjaCgocm93OiBhbnksIGluZGV4OiBhbnkpID0+IHtcclxuICAgICAgICAgIGtleVJvd3NTaGlmdFtpbmRleF0gPSByZW1vdmVLZXlzKHJvdywgdGhpcy5yZW1vdmVrcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG5cclxuICAgIGNvbnN0IGFkZFNwZWNpYWxCdXR0b25zID0gKHJvdzogc3RyaW5nKSA9PiB7XHJcbiAgICAgIC8vaWYgKCFyb3cuaW5jbHVkZXMoJ3tkb3dua2V5Ym9hcmR9JykpIHJvdyArPSAnIHtkb3dua2V5Ym9hcmR9JztcclxuICAgICAgaWYgKCFyb3cuaW5jbHVkZXMoJ3tsYW5nfScpKSByb3cgKz0gJyB7bGFuZ30nO1xyXG4gICAgICByZXR1cm4gcm93O1xyXG4gICAgfTtcclxuICBcclxuICAgIGlmIChrZXlSb3dzRGVmYXVsdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGtleVJvd3NEZWZhdWx0W2tleVJvd3NEZWZhdWx0Lmxlbmd0aCAtIDFdID0gYWRkU3BlY2lhbEJ1dHRvbnMoa2V5Um93c0RlZmF1bHRba2V5Um93c0RlZmF1bHQubGVuZ3RoIC0gMV0pO1xyXG4gICAgfVxyXG4gICAgaWYgKGtleVJvd3NTaGlmdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGtleVJvd3NTaGlmdFtrZXlSb3dzU2hpZnQubGVuZ3RoIC0gMV0gPSBhZGRTcGVjaWFsQnV0dG9ucyhrZXlSb3dzU2hpZnRba2V5Um93c1NoaWZ0Lmxlbmd0aCAtIDFdKTtcclxuICAgIH1cclxuICBcclxuICAgIC8vIFNldCB0aGUgb3B0aW9ucyBvbiB0aGUga2V5Ym9hcmRcclxuICAgIGlmICh0aGlzLmtleWJvYXJkKSB7XHJcbiAgICAgIHRoaXMua2V5Ym9hcmQuc2V0T3B0aW9ucyh7XHJcbiAgICAgICAgLi4udGhpcy5sYW5ndWFnZUxheW91dCxcclxuICAgICAgICBsYXlvdXROYW1lOiAnZGVmYXVsdCcsXHJcbiAgICAgICAgZGlzcGxheToge1xyXG4gICAgICAgICAgJ3t0YWJ9JzogJ+KGuScsXHJcbiAgICAgICAgICAne2Jrc3B9JzogJ+KMqycsXHJcbiAgICAgICAgICAne2Rvd25rZXlib2FyZH0nOiAnXFx1MjVCQycsXHJcbiAgICAgICAgICAne3NwYWNlfSc6ICcgJyxcclxuICAgICAgICAgICd7bGFuZ30nOiBgJHt0aGlzLmZsYWdVcmx9YCwgXHJcbiAgICAgICAgICAne2xvY2t9JzogJ+KHqicsXHJcbiAgICAgICAgICAne3NoaWZ0fSc6ICfih6cnLFxyXG4gICAgICAgICAgJ3tlbnRlcn0nOiAn4oa1JyxcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgLy8gRW1pdCB0aGUgbGFuZ3VhZ2UgY2hhbmdlXHJcbiAgICB0aGlzLmxhbmd1YWdlQ2hhbmdlLmVtaXQobGFuZ3VhZ2UpO1xyXG4gIH1cclxuICBcclxuXHJcblxyXG5cclxuXHJcbiAgc3dpdGNoTGFuZ3VhZ2VvbGQobGFuZ3VhZ2U6ICdlbmdsaXNoJyB8ICdnZW9yZ2lhbicpIHtcclxuXHJcblxyXG4gICAgXHJcblxyXG4gICAgdGhpcy5sYW5ndWFnZUxheW91dCA9IHRoaXMuZGVmYXVsdExhbmd1YWdlID09PSAnZW5nbGlzaCcgPyBlbmdsaXNoTGF5b3V0IDogZ2VvcmdpYW5sYXlvdXQ7XHJcblxyXG4gICAgY29uc3Qga2V5Um93c0RlZmF1bHQgPSB0aGlzLmxhbmd1YWdlTGF5b3V0LmxheW91dC5kZWZhdWx0O1xyXG4gICAga2V5Um93c0RlZmF1bHRba2V5Um93c0RlZmF1bHQubGVuZ3RoIC0gMV0gKz0gJyB7ZG93bmtleWJvYXJkfSc7XHJcbiAgICBrZXlSb3dzRGVmYXVsdFtrZXlSb3dzRGVmYXVsdC5sZW5ndGggLSAxXSArPSAnIHtsYW5nfSc7XHJcblxyXG4gICAgY29uc3Qga2V5Um93c1NoaWZ0ID0gdGhpcy5sYW5ndWFnZUxheW91dC5sYXlvdXQuc2hpZnQ7XHJcbiAgICBrZXlSb3dzU2hpZnRba2V5Um93c1NoaWZ0Lmxlbmd0aCAtIDFdICs9ICcge2Rvd25rZXlib2FyZH0nO1xyXG4gICBcclxuXHJcblxyXG4gICAgaWYgKHRoaXMua2V5Ym9hcmQpIHtcclxuICAgICAgdGhpcy5rZXlib2FyZC5zZXRPcHRpb25zKHtcclxuICAgICAgICAuLi50aGlzLmxhbmd1YWdlTGF5b3V0LFxyXG4gICAgICAgIGRpc3BsYXk6IHtcclxuICAgICAgICAgICd7dGFifSc6ICfihrknLFxyXG4gICAgICAgICAgJ3tia3NwfSc6ICfijKsnLFxyXG4gICAgICAgICAgJ3tkb3dua2V5Ym9hcmR9JzogJ1xcdTI1QkMnLFxyXG4gICAgICAgICAgJ3tzcGFjZX0nOiAnICcsXHJcbiAgICAgICAgICAne2xhbmd9JzogXCJMQU5HXCIsXHJcbiAgICAgICAgICAne2xvY2t9JzogJ+KHqicsXHJcbiAgICAgICAgICAne3NoaWZ0fSc6ICfih6cnLFxyXG4gICAgICAgICAgJ3tlbnRlcn0nOiAn4oa1JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxheW91dE5hbWU6ICdkZWZhdWx0JyxcclxuXHJcbiAgICAgICAgXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLnRvZ2dsZVNoaWZ0TGF5b3V0KCk7XHJcbiAgICAgIHRoaXMudG9nZ2xlU2hpZnRMYXlvdXQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICAvL3ByaXZhdGUgc2V0TGFuZ3VhZ2VMYXlvdXQobGFuZ3VhZ2U6ICdlbmdsaXNoJyB8ICdnZW9yZ2lhbicpIHtcclxuICAvLyAgdGhpcy5sYW5ndWFnZUxheW91dCA9IGxhbmd1YWdlID09PSAnZW5nbGlzaCcgPyBlbmdsaXNoTGF5b3V0IDogZ2VvcmdpYW5sYXlvdXQ7XHJcbi8vXHJcbiAgLy8gIHRoaXMubGFuZ3VhZ2VDaGFuZ2UuZW1pdChsYW5ndWFnZSk7XHJcbiAgLy99XHJcblxyXG4gIFxyXG4gIFxyXG4gIHByaXZhdGUgc2V0TGFuZ3VhZ2VMYXlvdXQobGFuZ3VhZ2U6ICdlbmdsaXNoJyB8ICdnZW9yZ2lhbicpIHtcclxuICAgIC8vIFNldCB0aGUgbGFuZ3VhZ2UgbGF5b3V0IGJhc2VkIG9uIHRoZSBzZWxlY3RlZCBsYW5ndWFnZVxyXG4gICAgdGhpcy5sYW5ndWFnZUxheW91dCA9IGxhbmd1YWdlID09PSAnZW5nbGlzaCcgPyBlbmdsaXNoTGF5b3V0IDogZ2VvcmdpYW5sYXlvdXQ7XHJcbiAgXHJcbiAgICAvLyBTYWZlbHkgYWNjZXNzIHRoZSBkZWZhdWx0IGFuZCBzaGlmdCBsYXlvdXRzXHJcbiAgICBjb25zdCBrZXlSb3dzRGVmYXVsdCA9IHRoaXMubGFuZ3VhZ2VMYXlvdXQ/LmRlZmF1bHQgfHwgW107XHJcbiAgICBjb25zdCBrZXlSb3dzU2hpZnQgPSB0aGlzLmxhbmd1YWdlTGF5b3V0Py5zaGlmdCB8fCBbXTtcclxuICBcclxuICAgIC8vIEZ1bmN0aW9uIHRvIGFkZCB7ZG93bmtleWJvYXJkfSBhbmQge2xhbmd9IGlmIG5vdCBwcmVzZW50XHJcbiAgICBjb25zdCBhZGRTcGVjaWFsQnV0dG9ucyA9IChyb3c6IHN0cmluZykgPT4ge1xyXG4gICAgICBpZiAoIXJvdy5pbmNsdWRlcygne2Rvd25rZXlib2FyZH0nKSkge1xyXG4gICAgICAgIHJvdyArPSAnIHtkb3dua2V5Ym9hcmR9JztcclxuICAgICAgfVxyXG4gICAgICBpZiAoIXJvdy5pbmNsdWRlcygne2xhbmd9JykpIHtcclxuICAgICAgICByb3cgKz0gJyB7bGFuZ30nO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiByb3c7XHJcbiAgICB9O1xyXG4gIFxyXG4gICAgLy8gTW9kaWZ5IHRoZSBsYXN0IHJvdyBvZiB0aGUgZGVmYXVsdCBsYXlvdXRcclxuICAgIGlmIChrZXlSb3dzRGVmYXVsdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGtleVJvd3NEZWZhdWx0W2tleVJvd3NEZWZhdWx0Lmxlbmd0aCAtIDFdID0gYWRkU3BlY2lhbEJ1dHRvbnMoa2V5Um93c0RlZmF1bHRba2V5Um93c0RlZmF1bHQubGVuZ3RoIC0gMV0pO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgLy8gTW9kaWZ5IHRoZSBsYXN0IHJvdyBvZiB0aGUgc2hpZnQgbGF5b3V0XHJcbiAgICBpZiAoa2V5Um93c1NoaWZ0Lmxlbmd0aCA+IDApIHtcclxuICAgICAga2V5Um93c1NoaWZ0W2tleVJvd3NTaGlmdC5sZW5ndGggLSAxXSA9IGFkZFNwZWNpYWxCdXR0b25zKGtleVJvd3NTaGlmdFtrZXlSb3dzU2hpZnQubGVuZ3RoIC0gMV0pO1xyXG4gICAgfVxyXG4gIFxyXG4gICAgLy8gRW1pdCB0aGUgbGFuZ3VhZ2UgY2hhbmdlIGV2ZW50XHJcbiAgICB0aGlzLmxhbmd1YWdlQ2hhbmdlLmVtaXQobGFuZ3VhZ2UpO1xyXG4gIH1cclxuICBcclxuXHJcbiAgcHJpdmF0ZSBpc0NoaWxkRWxlbWVudChjaGlsZDogSFRNTEVsZW1lbnQsIHRhcmdldDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcclxuICAgIGlmICh0YXJnZXQgPT09IGNoaWxkKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKGNoaWxkLnBhcmVudEVsZW1lbnQpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaXNDaGlsZEVsZW1lbnQoY2hpbGQucGFyZW50RWxlbWVudCwgdGFyZ2V0KTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIFxyXG5cclxuICBwcml2YXRlIG9uQ2hhbmdlKGlucHV0OiBzdHJpbmcpIHtcclxuICAgIC8vIEhhbmRsZSBpbnB1dCBjaGFuZ2UgaWYgbmVlZGVkXHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uS2V5UHJlc3MoYnV0dG9uOiBzdHJpbmcpIHtcclxuXHJcblxyXG5cclxuICAgIFxyXG4gICAgaWYgKCF0aGlzLmlucHV0RWxlbWVudCB8fCAhYnV0dG9uKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IHBvcyA9IHRoaXMuaW5wdXRFbGVtZW50LnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgY29uc3QgcG9zRW5kID0gdGhpcy5pbnB1dEVsZW1lbnQuc2VsZWN0aW9uRW5kO1xyXG5cclxuICAgIGlmICh0aGlzLmlucHV0RWxlbWVudC50eXBlLnRvTG93ZXJDYXNlKCkgPT09ICdudW1iZXInICYmIGJ1dHRvbiAhPT0gJ3t0YWJ9JyAmJiBidXR0b24gIT09ICd7ZG93bmtleWJvYXJkfScpIHtcclxuICAgICAgdGhpcy5vbktleVByZXNzTnVtZXJpYyhidXR0b24pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgc3dpdGNoIChidXR0b24pIHtcclxuICAgICAgY2FzZSAne3NoaWZ0fSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVTaGlmdFByZXNzKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3tsb2NrfSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVDYXBzTG9ja1ByZXNzZWQoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAne2VudGVyfSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVFbnRlclByZXNzKHBvcywgcG9zRW5kKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAne2Jrc3B9JzpcclxuICAgICAgICB0aGlzLmhhbmRsZUJhY2tzcGFjZVByZXNzKHBvcywgcG9zRW5kKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAne3RhYn0nOlxyXG4gICAgICAgIHRoaXMuaGFuZGxlVGFiUHJlc3MoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAne2Rvd25rZXlib2FyZH0nOlxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICd7c3BhY2V9JzpcclxuICAgICAgICB0aGlzLmhhbmRsZVNwYWNlUHJlc3MocG9zLCBwb3NFbmQpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3tsYW5nfSc6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVMYW5nc3dpdGNoKCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhpcy5oYW5kbGVEZWZhdWx0S2V5UHJlc3MoYnV0dG9uLCBwb3MsIHBvc0VuZCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJ1dHRvbiAhPT0gJ3tzaGlmdH0nKSB7XHJcbiAgICAgIHRoaXMuZGlzYWJsZVNoaWZ0UHJlc3MoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgb25LZXlSZWxlYXNlKGJ1dHRvbjogc3RyaW5nKSB7XHJcbiAgICBpZiAoYnV0dG9uID09PSAne2Rvd25rZXlib2FyZH0nKSB7XHJcbiAgICAgIHRoaXMub25Gb2N1c091dCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIHByaXZhdGUgb25Nb3VzZVVwKGV2ZW50OiBNb3VzZUV2ZW50KSB7XHJcbiAgICB0aGlzLmlzTW91c2VEb3duID0gZmFsc2U7XHJcbiAgXHJcbiAgICBpZiAoIXRoaXMuaW5wdXRFbGVtZW50IHx8ICF0aGlzLmlucHV0RWxlbWVudC5jb250YWlucyhldmVudC50YXJnZXQgYXMgTm9kZSkgfHwgIXRoaXMua2V5Ym9hcmRDb250YWluZXIpIHtcclxuICAgICAvLyB0aGlzLmhpZGVLZXlib2FyZCgpO1xyXG4gICAgIC8vIHRoaXMuaGlkZUtleWJvYXJkVG9nZ2xlcigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbk1vdXNlVXBOZXcoZXZlbnQ6IE1vdXNlRXZlbnQpIHtcclxuICAgIHRoaXMuaXNNb3VzZURvd24gPSBmYWxzZTtcclxuICBcclxuICAgIC8vIEFjY2VzcyBuYXRpdmUgZWxlbWVudHMgZnJvbSBFbGVtZW50UmVmXHJcbiAgICBjb25zdCBpbnB1dEVsZW1lbnROYXRpdmUgPSB0aGlzLmlucHV0RWxlbWVudDtcclxuICAgIGNvbnN0IGtleWJvYXJkQ29udGFpbmVyTmF0aXZlID0gdGhpcy5rZXlib2FyZENvbnRhaW5lciA/IHRoaXMua2V5Ym9hcmRDb250YWluZXIubmF0aXZlRWxlbWVudCA6IG51bGw7XHJcbiAgXHJcbiAgICAvLyBDaGVjayBpZiB0aGUgY2xpY2sgd2FzIG91dHNpZGUgYm90aCBpbnB1dEVsZW1lbnQgYW5kIGtleWJvYXJkQ29udGFpbmVyXHJcbiAgICBpZiAoIWlucHV0RWxlbWVudE5hdGl2ZSB8fCAhaW5wdXRFbGVtZW50TmF0aXZlLmNvbnRhaW5zKGV2ZW50LnRhcmdldCBhcyBOb2RlKSkge1xyXG4gICAgICBpZiAoIWtleWJvYXJkQ29udGFpbmVyTmF0aXZlIHx8ICFrZXlib2FyZENvbnRhaW5lck5hdGl2ZS5jb250YWlucyhldmVudC50YXJnZXQgYXMgTm9kZSkpIHtcclxuICAgICAgICB0aGlzLmhpZGVLZXlib2FyZCgpO1xyXG4gICAgICAgIHRoaXMuaGlkZUtleWJvYXJkVG9nZ2xlcigpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgcHJpdmF0ZSBvbktleVByZXNzTnVtZXJpYyhidXR0b246IHN0cmluZykge1xyXG4gICAgaWYgKCFbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgJ3tia3NwfSddLnNvbWUoeCA9PiBTdHJpbmcoeCkgPT09IGJ1dHRvbikpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKGJ1dHRvbiA9PT0gJ3tia3NwfScpIHtcclxuICAgICAgY29uc3Qgc3RyVmFsdWUgPSBTdHJpbmcodGhpcy5pbnB1dEVsZW1lbnQhLnZhbHVlKTtcclxuICAgICAgaWYgKHN0clZhbHVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICB0aGlzLmlucHV0RWxlbWVudCEudmFsdWUgPSBzdHJWYWx1ZS5zdWJzdHJpbmcoMCwgc3RyVmFsdWUubGVuZ3RoIC0gMSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuaW5wdXRFbGVtZW50IS52YWx1ZSArPSBidXR0b247XHJcbiAgICB9XHJcbiAgICB0aGlzLnBlcmZvcm1OYXRpdmVLZXlQcmVzcyh0aGlzLmlucHV0RWxlbWVudCEsIGJ1dHRvbi5jaGFyQ29kZUF0KDApKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRW50ZXJQcmVzcyhwb3M6IG51bWJlciB8IG51bGwsIHBvc0VuZDogbnVtYmVyIHwgbnVsbCkge1xyXG4gICAgaWYgKHRoaXMuaW5wdXRFbGVtZW50IS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICd0ZXh0YXJlYScpIHtcclxuICAgICAgY29uc3QgYnV0dG9uID0gJ1xcbic7XHJcbiAgICAgIGlmIChwb3MgIT09IG51bGwgJiYgcG9zRW5kICE9PSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5pbnB1dEVsZW1lbnQhLnZhbHVlID1cclxuICAgICAgICAgIHRoaXMuaW5wdXRFbGVtZW50IS52YWx1ZS5zdWJzdHIoMCwgcG9zKSArXHJcbiAgICAgICAgICBidXR0b24gK1xyXG4gICAgICAgICAgdGhpcy5pbnB1dEVsZW1lbnQhLnZhbHVlLnN1YnN0cihwb3NFbmQpO1xyXG4gICAgICAgIHRoaXMuaW5wdXRFbGVtZW50IS5zZWxlY3Rpb25TdGFydCA9IHBvcyArIDE7XHJcbiAgICAgICAgdGhpcy5pbnB1dEVsZW1lbnQhLnNlbGVjdGlvbkVuZCA9IHBvcyArIDE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5pbnB1dEVsZW1lbnQhLnZhbHVlICs9IGJ1dHRvbjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5wZXJmb3JtTmF0aXZlS2V5UHJlc3ModGhpcy5pbnB1dEVsZW1lbnQhLCAxMyk7XHJcbiAgfVxyXG5cclxuXHJcblxyXG4gIHByaXZhdGUgaGFuZGxlTGFuZ3N3aXRjaCgpIHtcclxuICB0aGlzLmRlZmF1bHRMYW5ndWFnZSA9IHRoaXMuZGVmYXVsdExhbmd1YWdlID09PSB0aGlzLnNlY29uZExhbmd1YWdlXHJcbiAgPyB0aGlzLm9yaWdpbmFsRGVmYXVsdExhbmd1YWdlIFxyXG4gIDogdGhpcy5zZWNvbmRMYW5ndWFnZTsgXHJcbiAgdGhpcy5zd2l0Y2hMYW5ndWFnZSh0aGlzLmRlZmF1bHRMYW5ndWFnZSk7XHJcbiAgfVxyXG4gIFxyXG4gIFxyXG4gIHByaXZhdGUgaGFuZGxlTGFuZ3N3aXRjaERFRigpe1xyXG4gICAgdGhpcy5kZWZhdWx0TGFuZ3VhZ2UgPSB0aGlzLmRlZmF1bHRMYW5ndWFnZSA9PT0gJ2VuZ2xpc2gnID8gJ2dlb3JnaWFuJyA6ICdlbmdsaXNoJztcclxuICAgIHRoaXMuc3dpdGNoTGFuZ3VhZ2UodGhpcy5kZWZhdWx0TGFuZ3VhZ2UpXHJcblxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVCYWNrc3BhY2VQcmVzcyhwb3M6IG51bWJlciB8IG51bGwsIHBvc0VuZDogbnVtYmVyIHwgbnVsbCkge1xyXG4gICAgaWYgKCF0aGlzLmlucHV0RWxlbWVudCB8fCBwb3MgPT09IG51bGwgfHwgcG9zRW5kID09PSBudWxsKSByZXR1cm47XHJcbiAgXHJcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuaW5wdXRFbGVtZW50LnZhbHVlO1xyXG4gIFxyXG4gICAgaWYgKHBvcyA9PT0gcG9zRW5kKSB7XHJcbiAgICAgIC8vIElmIHRoZXJlJ3Mgbm8gc2VsZWN0aW9uLCBkZWxldGUgb25lIGNoYXJhY3RlciBiZWZvcmUgdGhlIGN1cnNvclxyXG4gICAgICBpZiAocG9zID4gMCkge1xyXG4gICAgICAgIGNvbnN0IGJlZm9yZSA9IHZhbHVlLnN1YnN0cmluZygwLCBwb3MgLSAxKTtcclxuICAgICAgICBjb25zdCBhZnRlciA9IHZhbHVlLnN1YnN0cmluZyhwb3MpO1xyXG4gICAgICAgIHRoaXMuaW5wdXRFbGVtZW50LnZhbHVlID0gYmVmb3JlICsgYWZ0ZXI7XHJcbiAgXHJcbiAgICAgICAgLy8gTW92ZSB0aGUgY3Vyc29yIG9uZSBwb3NpdGlvbiBiYWNrXHJcbiAgICAgICAgY29uc3QgbmV3UG9zID0gcG9zIC0gMTtcclxuICAgICAgICB0aGlzLmlucHV0RWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShuZXdQb3MsIG5ld1Bvcyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIElmIHRoZXJlJ3MgYSBzZWxlY3Rpb24sIGRlbGV0ZSB0aGUgc2VsZWN0ZWQgcmFuZ2Ugb2YgdGV4dFxyXG4gICAgICBjb25zdCBiZWZvcmUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgcG9zKTtcclxuICAgICAgY29uc3QgYWZ0ZXIgPSB2YWx1ZS5zdWJzdHJpbmcocG9zRW5kKTtcclxuICAgICAgdGhpcy5pbnB1dEVsZW1lbnQudmFsdWUgPSBiZWZvcmUgKyBhZnRlcjtcclxuICBcclxuICAgICAgLy8gU2V0IHRoZSBjdXJzb3IgdG8gdGhlIHN0YXJ0IG9mIHRoZSBkZWxldGlvblxyXG4gICAgICB0aGlzLmlucHV0RWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShwb3MsIHBvcyk7XHJcbiAgICB9XHJcbiAgXHJcbiAgICAvLyBSZWZvY3VzIHRoZSBpbnB1dCBlbGVtZW50IHRvIGVuc3VyZSBpdCBzdGF5cyBmb2N1c2VkXHJcbiAgICB0aGlzLmlucHV0RWxlbWVudC5mb2N1cygpO1xyXG4gIH1cclxuICBcclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVUYWJQcmVzcygpIHtcclxuICAgIGNvbnN0IGlucHV0TGlzdCA9IEFycmF5LmZyb20odGhpcy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMucXVlcnlTZWxlY3RvcikpO1xyXG4gICAgY29uc3QgaW5kZXggPSBpbnB1dExpc3QuaW5kZXhPZih0aGlzLmlucHV0RWxlbWVudCEpO1xyXG4gICAgKGlucHV0TGlzdFsoaW5kZXggKyAxKSAlIGlucHV0TGlzdC5sZW5ndGhdIGFzIEhUTUxFbGVtZW50KS5mb2N1cygpO1xyXG4gIH1cclxuXHJcblxyXG4gIHByaXZhdGUgaGFuZGxlU3BhY2VQcmVzcyhwb3M6IG51bWJlciB8IG51bGwsIHBvc0VuZDogbnVtYmVyIHwgbnVsbCkge1xyXG4gICAgaWYgKCF0aGlzLmlucHV0RWxlbWVudCB8fCBwb3MgPT09IG51bGwgfHwgcG9zRW5kID09PSBudWxsKSByZXR1cm47XHJcbiAgXHJcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuaW5wdXRFbGVtZW50LnZhbHVlO1xyXG4gIFxyXG4gICAgaWYgKHBvcyA9PT0gcG9zRW5kKSB7XHJcbiAgICAgIC8vIElmIHRoZXJlJ3Mgbm8gc2VsZWN0aW9uLCBpbnNlcnQgYSBzcGFjZSBhdCB0aGUgY3Vyc29yIHBvc2l0aW9uXHJcbiAgICAgIGNvbnN0IGJlZm9yZSA9IHZhbHVlLnN1YnN0cmluZygwLCBwb3MpO1xyXG4gICAgICBjb25zdCBhZnRlciA9IHZhbHVlLnN1YnN0cmluZyhwb3MpO1xyXG4gICAgICB0aGlzLmlucHV0RWxlbWVudC52YWx1ZSA9IGJlZm9yZSArICcgJyArIGFmdGVyO1xyXG4gIFxyXG4gICAgICAvLyBNb3ZlIHRoZSBjdXJzb3Igb25lIHBvc2l0aW9uIHRvIHRoZSByaWdodFxyXG4gICAgICBjb25zdCBuZXdQb3MgPSBwb3MgKyAxO1xyXG4gICAgICB0aGlzLmlucHV0RWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShuZXdQb3MsIG5ld1Bvcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBJZiB0aGVyZSdzIGEgc2VsZWN0aW9uLCByZXBsYWNlIHRoZSBzZWxlY3RlZCB0ZXh0IHdpdGggYSBzcGFjZVxyXG4gICAgICBjb25zdCBiZWZvcmUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgcG9zKTtcclxuICAgICAgY29uc3QgYWZ0ZXIgPSB2YWx1ZS5zdWJzdHJpbmcocG9zRW5kKTtcclxuICAgICAgdGhpcy5pbnB1dEVsZW1lbnQudmFsdWUgPSBiZWZvcmUgKyAnICcgKyBhZnRlcjtcclxuICBcclxuICAgICAgLy8gU2V0IHRoZSBjdXJzb3IgdG8gdGhlIHBvc2l0aW9uIGFmdGVyIHRoZSBpbnNlcnRlZCBzcGFjZVxyXG4gICAgICB0aGlzLmlucHV0RWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShwb3MgKyAxLCBwb3MgKyAxKTtcclxuICAgIH1cclxuICBcclxuICAgIC8vIFJlZm9jdXMgdGhlIGlucHV0IGVsZW1lbnQgdG8gZW5zdXJlIGl0IHN0YXlzIGZvY3VzZWRcclxuICAgIHRoaXMuaW5wdXRFbGVtZW50LmZvY3VzKCk7XHJcbiAgfVxyXG4gIFxyXG5cclxuICBwcml2YXRlIGhhbmRsZURlZmF1bHRLZXlQcmVzcyhidXR0b246IHN0cmluZywgcG9zOiBudW1iZXIgfCBudWxsLCBwb3NFbmQ6IG51bWJlciB8IG51bGwpIHtcclxuICAgIGlmICghdGhpcy5pbnB1dEVsZW1lbnQgfHwgcG9zID09PSBudWxsIHx8IHBvc0VuZCA9PT0gbnVsbCkgcmV0dXJuO1xyXG4gIFxyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmlucHV0RWxlbWVudC52YWx1ZTtcclxuICBcclxuICAgIC8vIEluc2VydCB0aGUgYnV0dG9uIGF0IHRoZSBjdXJzb3IgcG9zaXRpb25cclxuICAgIGNvbnN0IGJlZm9yZSA9IHZhbHVlLnN1YnN0cmluZygwLCBwb3MpO1xyXG4gICAgY29uc3QgYWZ0ZXIgPSB2YWx1ZS5zdWJzdHJpbmcocG9zRW5kKTtcclxuICBcclxuICAgIC8vIFVwZGF0ZSB0aGUgaW5wdXQgdmFsdWUgd2l0aCB0aGUgbmV3IGNoYXJhY3RlclxyXG4gICAgdGhpcy5pbnB1dEVsZW1lbnQudmFsdWUgPSBiZWZvcmUgKyBidXR0b24gKyBhZnRlcjtcclxuICBcclxuICAgIC8vIFVwZGF0ZSB0aGUgY3Vyc29yIHBvc2l0aW9uIGV4cGxpY2l0bHkgdG8gcHJldmVudCByZXNldFxyXG4gICAgY29uc3QgbmV3UG9zID0gcG9zICsgYnV0dG9uLmxlbmd0aDtcclxuICAgIFxyXG4gICAgLy8gTG9nIHRoZSBjdXJzb3IgcG9zaXRpb24gdG8gZGVidWdcclxuICAvLyAgY29uc29sZS5sb2coYEN1cnNvciBwb3NpdGlvbiBiZWZvcmU6ICR7cG9zfSwgYWZ0ZXI6ICR7bmV3UG9zfWApO1xyXG4gIFxyXG4gICAgLy8gU2V0IHRoZSBuZXcgY3Vyc29yIHBvc2l0aW9uXHJcbiAgICB0aGlzLmlucHV0RWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShuZXdQb3MsIG5ld1Bvcyk7XHJcbiAgXHJcbiAgICAvLyBSZWZvY3VzIHRoZSBpbnB1dCBlbGVtZW50IHRvIHByZXZlbnQgbG9zaW5nIGZvY3VzXHJcbiAgICB0aGlzLmlucHV0RWxlbWVudC5mb2N1cygpO1xyXG4gIH1cclxuICBcclxuXHJcbiAgcHJpdmF0ZSBwZXJmb3JtTmF0aXZlS2V5UHJlc3MoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleUNvZGU6IG51bWJlcikge1xyXG4gICAgY29uc3Qga2V5ZG93bkV2ZW50ID0gbmV3IEtleWJvYXJkRXZlbnQoJ2tleWRvd24nLCB7IGtleUNvZGU6IGtleUNvZGUsIHdoaWNoOiBrZXlDb2RlIH0pO1xyXG4gICAgY29uc3Qga2V5cHJlc3NFdmVudCA9IG5ldyBLZXlib2FyZEV2ZW50KCdrZXlwcmVzcycsIHsga2V5Q29kZToga2V5Q29kZSwgd2hpY2g6IGtleUNvZGUgfSk7XHJcbiAgICBjb25zdCBpbnB1dEV2ZW50ID0gbmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSB9KTtcclxuICAgIFxyXG4gICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGtleWRvd25FdmVudCk7XHJcbiAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoa2V5cHJlc3NFdmVudCk7XHJcbiAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoaW5wdXRFdmVudCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9uRm9jdXMxKHRhcmdldDogSFRNTElucHV0RWxlbWVudCkge1xyXG4gICAgdGhpcy5pbnB1dEVsZW1lbnQgPSB0YXJnZXQ7XHJcbiAgICBpZiAodGFyZ2V0LnR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgdGhpcy5rZXlib2FyZC5zZXRPcHRpb25zKHtcclxuICAgICAgICBsYXlvdXQ6IHRoaXMubnVtZXJpY0xheW91dCxcclxuICAgICAgICBsYXlvdXROYW1lOiAnZGVmYXVsdCcsXHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5rZXlib2FyZC5zZXRPcHRpb25zKHtcclxuICAgICAgICAuLi50aGlzLmxhbmd1YWdlTGF5b3V0LFxyXG4gICAgICAgIGxheW91dE5hbWU6ICdkZWZhdWx0JyxcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaW5wdXRFbGVtZW50Lm1hdGNoZXMoJy5uby1rZXlib2FyZCcpKSB7XHJcbiAgICAgIHRoaXMuc2hvd0tleWJvYXJkVG9nZ2xlcigpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5oaWRlS2V5Ym9hcmRUb2dnbGVyKCk7XHJcbiAgICB0aGlzLnNob3dLZXlib2FyZCgpO1xyXG4gICAgXHJcbiAgICBjb25zdCBvZmZzZXQgPSA1MDtcclxuICAgIGNvbnN0IGJvZHlSZWN0ID0gdGhpcy5kb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgIGNvbnN0IGVsZW1lbnRSZWN0ID0gdGhpcy5pbnB1dEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG4gICAgY29uc3QgZWxlbWVudFBvc2l0aW9uID0gZWxlbWVudFJlY3QgLSBib2R5UmVjdDtcclxuICAgIGNvbnN0IG9mZnNldFBvc2l0aW9uID0gZWxlbWVudFBvc2l0aW9uIC0gb2Zmc2V0O1xyXG4gICAgd2luZG93LnNjcm9sbFRvKHsgdG9wOiBvZmZzZXRQb3NpdGlvbiwgYmVoYXZpb3I6ICdzbW9vdGgnIH0pO1xyXG4gIH1cclxuXHJcblxyXG4gIHByaXZhdGUgb25Gb2N1cyh0YXJnZXQ6IEhUTUxJbnB1dEVsZW1lbnQpIHtcclxuICB0aGlzLmlucHV0RWxlbWVudCA9IHRhcmdldDtcclxuXHJcbiAgLy8gQ2hlY2sgaWYgdGhlIHRhcmdldCBpcyBhIHRleHQgaW5wdXQsIG51bWJlciBpbnB1dCwgb3IgdGV4dGFyZWFcclxuICBpZiAodGFyZ2V0LnR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ3RleHQnIHx8IHRhcmdldC50eXBlLnRvTG93ZXJDYXNlKCkgPT09ICdudW1iZXInIHx8IHRhcmdldC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICd0ZXh0YXJlYScpIHtcclxuICAgIGlmICh0YXJnZXQudHlwZS50b0xvd2VyQ2FzZSgpID09PSAnbnVtYmVyJykge1xyXG4gICAgICB0aGlzLmtleWJvYXJkLnNldE9wdGlvbnMoe1xyXG4gICAgICAgIGxheW91dDogdGhpcy5udW1lcmljTGF5b3V0LFxyXG4gICAgICAgIGxheW91dE5hbWU6ICdkZWZhdWx0JyxcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmtleWJvYXJkLnNldE9wdGlvbnMoe1xyXG4gICAgICAgIC4uLnRoaXMubGFuZ3VhZ2VMYXlvdXQsXHJcbiAgICAgICAgbGF5b3V0TmFtZTogJ2RlZmF1bHQnLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaG93IGtleWJvYXJkIGFuZCBoYW5kbGUgc2Nyb2xsaW5nXHJcbiAgICB0aGlzLmhpZGVLZXlib2FyZFRvZ2dsZXIoKTtcclxuICAgIHRoaXMuc2hvd0tleWJvYXJkKCk7XHJcblxyXG4gICAgY29uc3Qgb2Zmc2V0ID0gNTA7XHJcbiAgICBjb25zdCBib2R5UmVjdCA9IHRoaXMuZG9jdW1lbnQuYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICBjb25zdCBlbGVtZW50UmVjdCA9IHRoaXMuaW5wdXRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgIGNvbnN0IGVsZW1lbnRQb3NpdGlvbiA9IGVsZW1lbnRSZWN0IC0gYm9keVJlY3Q7XHJcbiAgICBjb25zdCBvZmZzZXRQb3NpdGlvbiA9IGVsZW1lbnRQb3NpdGlvbiAtIG9mZnNldDtcclxuICAgIHdpbmRvdy5zY3JvbGxUbyh7IHRvcDogb2Zmc2V0UG9zaXRpb24sIGJlaGF2aW9yOiAnc21vb3RoJyB9KTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5oaWRlS2V5Ym9hcmQoKTtcclxuICAgIHRoaXMuaGlkZUtleWJvYXJkVG9nZ2xlcigpO1xyXG4gIH1cclxufVxyXG5cclxuICBwcml2YXRlIHNob3dLZXlib2FyZFRvZ2dsZXIoKSB7XHJcbiAgICB0aGlzLnJlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMua2V5Ym9hcmRUb2dnbGVyLm5hdGl2ZUVsZW1lbnQsICdoaWRkZW4nKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGlkZUtleWJvYXJkVG9nZ2xlcigpIHtcclxuICAgIHRoaXMucmVuZGVyZXIuYWRkQ2xhc3ModGhpcy5rZXlib2FyZFRvZ2dsZXIubmF0aXZlRWxlbWVudCwgJ2hpZGRlbicpO1xyXG4gIH1cclxuXHJcbiAgdG9nZ2xlS2V5Ym9hcmQoKSB7XHJcbiAgICBpZiAodGhpcy5rZXlib2FyZENvbnRhaW5lci5uYXRpdmVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPT09ICdub25lJykge1xyXG4gICAgICB0aGlzLnNob3dLZXlib2FyZCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvbkZvY3VzT3V0KCkge1xyXG4gICAgaWYgKHRoaXMuaW5wdXRFbGVtZW50KSB7XHJcbiAgICAgIHRoaXMuaW5wdXRFbGVtZW50LmJsdXIoKTtcclxuICAgICAgdGhpcy5pbnB1dEVsZW1lbnQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgdGhpcy5oaWRlS2V5Ym9hcmQoKTtcclxuICAgIHRoaXMuaGlkZUtleWJvYXJkVG9nZ2xlcigpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93S2V5Ym9hcmQoKSB7XHJcbiAgICBjb25zdCBkaWFsb2dzID0gdGhpcy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZml4ZWQtZnVsbCcpO1xyXG4gICAgaWYgKHRoaXMua2V5Ym9hcmRIaWRlVGFzayAhPSBudWxsKSB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmtleWJvYXJkSGlkZVRhc2spO1xyXG4gICAgICB0aGlzLmtleWJvYXJkSGlkZVRhc2sgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmtleWJvYXJkQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQsICdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICBjb25zdCBrZXlib2FyZEhlaWdodCA9IHRoaXMua2V5Ym9hcmRDb250YWluZXIubmF0aXZlRWxlbWVudC5vZmZzZXRIZWlnaHQ7XHJcbiAgICBjb25zdCBzdHlsZSA9IGBwYWRkaW5nLWJvdHRvbTogJHtrZXlib2FyZEhlaWdodH1weCAhaW1wb3J0YW50YDtcclxuICAgIHRoaXMucmVuZGVyZXIuc2V0QXR0cmlidXRlKHRoaXMuZG9jdW1lbnQuYm9keSwgJ3N0eWxlJywgc3R5bGUpO1xyXG4gICAgZGlhbG9ncy5mb3JFYWNoKGRpYWxvZyA9PiB0aGlzLnJlbmRlcmVyLnNldEF0dHJpYnV0ZShkaWFsb2csICdzdHlsZScsIHN0eWxlKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNoZWNrS2V5Ym9hcmQoKSB7XHJcbiAgICBpZiAodGhpcy5pc01vdXNlRG93bikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBhY3RpdmVFbGVtZW50ID0gdGhpcy5kb2N1bWVudC5hY3RpdmVFbGVtZW50IGFzIEhUTUxJbnB1dEVsZW1lbnQ7XHJcbiAgICBpZiAoYWN0aXZlRWxlbWVudC5tYXRjaGVzKHRoaXMucXVlcnlTZWxlY3RvcikpIHtcclxuICAgICAgaWYgKHRoaXMuaW5wdXRFbGVtZW50ICE9PSBhY3RpdmVFbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5vbkZvY3VzKGFjdGl2ZUVsZW1lbnQpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy5pbnB1dEVsZW1lbnQgIT09IG51bGwpIHtcclxuICAgICAgICB0aGlzLm9uRm9jdXNPdXQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoaWRlS2V5Ym9hcmQoKSB7XHJcbiAgICB0aGlzLmtleWJvYXJkSGlkZVRhc2sgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgY29uc3QgZGlhbG9ncyA9IHRoaXMuZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmZpeGVkLWZ1bGwnKTtcclxuICAgICAgdGhpcy5yZW5kZXJlci5zZXRTdHlsZSh0aGlzLmtleWJvYXJkQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQsICdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgICAgdGhpcy5yZW5kZXJlci5yZW1vdmVBdHRyaWJ1dGUodGhpcy5kb2N1bWVudC5ib2R5LCAnc3R5bGUnKTtcclxuICAgICAgdGhpcy5rZXlib2FyZEhpZGVUYXNrID0gbnVsbDtcclxuICAgICAgZGlhbG9ncy5mb3JFYWNoKGRpYWxvZyA9PiB0aGlzLnJlbmRlcmVyLnJlbW92ZUF0dHJpYnV0ZShkaWFsb2csICdzdHlsZScpKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYW5kbGVTaGlmdFByZXNzKCkge1xyXG4gICAgdGhpcy5zaGlmdFByZXNzZWQgPSAhdGhpcy5zaGlmdFByZXNzZWQ7XHJcbiAgICB0aGlzLnRvZ2dsZVNoaWZ0TGF5b3V0KCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZUNhcHNMb2NrUHJlc3NlZCgpIHtcclxuICAgIHRoaXMudG9nZ2xlU2hpZnRMYXlvdXQoKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZGlzYWJsZVNoaWZ0UHJlc3MoKSB7XHJcbiAgICBpZiAoIXRoaXMuc2hpZnRQcmVzc2VkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuc2hpZnRQcmVzc2VkID0gZmFsc2U7XHJcbiAgICB0aGlzLnRvZ2dsZVNoaWZ0TGF5b3V0KCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHRvZ2dsZVNoaWZ0TGF5b3V0KCkge1xyXG4gICAgY29uc3QgY3VycmVudExheW91dCA9IHRoaXMua2V5Ym9hcmQub3B0aW9ucy5sYXlvdXROYW1lO1xyXG4gICAgY29uc3Qgc2hpZnRUb2dnbGUgPSBjdXJyZW50TGF5b3V0ID09PSAnZGVmYXVsdCcgPyAnc2hpZnQnIDogJ2RlZmF1bHQnO1xyXG4gICAgdGhpcy5rZXlib2FyZC5zZXRPcHRpb25zKHtcclxuICAgICAgbGF5b3V0TmFtZTogc2hpZnRUb2dnbGUsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG59XHJcbiJdfQ==