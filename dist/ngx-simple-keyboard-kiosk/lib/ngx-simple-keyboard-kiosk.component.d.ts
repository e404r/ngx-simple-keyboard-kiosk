import { OnInit, ElementRef, EventEmitter, Renderer2 } from '@angular/core';
import { CountryService } from './country.service';
import * as i0 from "@angular/core";
export declare class NgxSimpleKeyboardKioskComponent implements OnInit {
    private renderer;
    private flags;
    private document;
    keyboardContainer: ElementRef;
    keyboardToggler: ElementRef;
    defaultLanguage: string;
    secondLanguage: string;
    removeks: any[];
    private originalDefaultLanguage;
    languageChange: EventEmitter<string>;
    private keyboard;
    private inputElement;
    private shiftPressed;
    private isMouseDown;
    private languageLayout;
    private languageLayouts;
    private flagUrl;
    private keyboardHideTask;
    private readonly numericLayout;
    private readonly querySelector;
    constructor(renderer: Renderer2, flags: CountryService, document: Document);
    ngOnInit(): void;
    private setupKeyboard;
    private setupEventListeners;
    private setupEventListenersOLD;
    private updateKeyboardLayout;
    switchLanguage(language: string): void;
    switchLanguageold(language: 'english' | 'georgian'): void;
    private isChildElement;
    private onChange;
    private onKeyPress;
    private onKeyRelease;
    private onMouseUp;
    private onMouseUpNew;
    private onKeyPressNumeric;
    private handleEnterPress;
    private handleLangswitch;
    private handleBackspacePress;
    private handleTabPress;
    private handleSpacePress;
    private handleDefaultKeyPress;
    private performNativeKeyPress;
    private onFocus1;
    private onFocus;
    private showKeyboardToggler;
    private hideKeyboardToggler;
    toggleKeyboard(): void;
    private onFocusOut;
    private showKeyboard;
    private checkKeyboard;
    private hideKeyboard;
    private handleShiftPress;
    private handleCapsLockPressed;
    private disableShiftPress;
    private toggleShiftLayout;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgxSimpleKeyboardKioskComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NgxSimpleKeyboardKioskComponent, "ngx-simple-keyboard-kiosk", never, { "defaultLanguage": { "alias": "defaultLanguage"; "required": false; }; "secondLanguage": { "alias": "secondLanguage"; "required": false; }; "removeks": { "alias": "removeks"; "required": false; }; }, { "languageChange": "languageChange"; }, never, never, false, never>;
}
