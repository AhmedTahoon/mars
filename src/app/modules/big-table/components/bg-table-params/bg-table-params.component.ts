import {AfterViewInit, Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-bg-table-params',
  templateUrl: './bg-table-params.component.html',
  styleUrls: ['./bg-table-params.component.css']
})
export class BgTableParamsComponent implements OnInit, AfterViewInit {
  query = "find_run_submissions -q \"submit_time> '2018-12-15' and submitter='rabdelgh'\" --max_results 1";
  @Output() tableParam = new EventEmitter<string>();
  constructor() {
    var re = /\/json/gi;
    let href_arr = window.location.href.split('?');
    if (window.location.href.search(re) == -1 ) {
      console.log("Does not contain json" );
   } else {
      return
   }
    if (href_arr.length > 1) {
      this.query = decodeURIComponent(href_arr[1]);
      console.log(this.query);
    }
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.tableParam.emit('pattern='+this.query);
  }


  tellParentNewParams(event) {
    console.log(event.keyCode == 13);
    if (event.keyCode == 13) { // user pressed enter
      event.preventDefault();
      console.log(this.query);
      this.tableParam.emit('pattern='+this.query);
    }
  }

}
