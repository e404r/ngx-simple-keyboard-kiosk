import { Component, ViewChild } from '@angular/core';
import { SurveyModel } from 'survey-core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  survey!: SurveyModel;

  title = 'simple-keyboard-kiosk';




  constructor() {
    const json = {
      title: 'Survey with  ngx-simple-keyboard-kiosk',
      pages: [
        {
          name: 'Name',
          elements: [
            { type: 'text', name: 'FirstName', title: 'Enter your first name:' },
            { type: 'text', name: 'LastName', title: 'Enter your last name:' },
          ]
        },
        {
          name: 'page1',
          elements: [{ type: 'text', name: 'question2' },

            { type: 'file', name: 'question1', allowMultiple: true, sourceType: 'camera' }

          ]
          
        },
        {
          name: 'page2',
          elements: [{ type: 'text', name: 'question3' }]
        }
      ],
      showPageNumbers: true,
      widthMode: 'responsive'
    };
    
    this.survey = new SurveyModel(json);

    console.log(this.survey);
    
  }






}
