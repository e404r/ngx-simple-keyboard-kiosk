
# ngx-simple-keyboard-kiosk
This module is designed for use in kiosk projects.
FOR ANGULAR 17

## Demo

https://stackblitz.com/~/github.com/e404r/ngx-simple-keyboard-kiosk


## Installation


```bash
npm i simple-keyboard simple-keyboard-layouts ngx-simple-keyboard-kiosk
```
    

    
## Usage/Examples

app.module.ts
```javascript

import { NgxSimpleKeyboardKioskModule } from "ngx-simple-keyboard-kiosk";


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxSimpleKeyboardKioskModule,
    ......
  
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```


app.component.html
```html
<ngx-simple-keyboard-kiosk 
  [defaultLanguage]="'georgian'"
  [secondLanguage]="'english'"
  [removeks]="['.com', '@']"
  >
</ngx-simple-keyboard-kiosk>

```


styles.scss
```css
/* Importing ngx-simple-keyboard-kiosk SCSS file. */
@import 'ngx-simple-keyboard-kiosk/styles.scss';

```




## HTML Variables


Startup language: `[defaultLanguage]="'georgian'"`

Changeable language: `[secondLanguage]="'english'"`

Delete the keys you don't want:  `[removeks]="['.com', '@']" `


 [List of languages](https://github.com/simple-keyboard/simple-keyboard-layouts/tree/master/build/layouts)


## Acknowledgements

 - [simple-keyboard](https://github.com/hodgef/simple-keyboard)
 - [simple-keyboard-layouts](https://github.com/simple-keyboard/simple-keyboard-layouts)
 - [surveyjs](https://surveyjs.io/)


