import {
  Component,
  OnInit
} from '@angular/core';

@Component({
  selector: 'app-mars-commands',
  templateUrl: './mars-commands.component.html',
  styleUrls: ['./mars-commands.component.css']
})
export class MarsCommandsComponent implements OnInit {
  mars_commands_list="";
  //dashbord_input = '[{"big_title":"nmOPC (Eric)","user":"emartins","product":"denseopc","vcos":"aoj","groups":"MT MT_mtflex mtflexonly_mtflex nonMT nonmt_mtflex","last":"1","id":1,"title":"nmOPC (Eric)","children":[{"title":" TOT","pattern":"*PRODUCT_${tot}_tot_*_{assert_,,}GROUP.VCO","id":2,"_parentId":1,"state":"open"},{"title":"BRANCH","pattern":"*PRODUCT_${branch}*_{assert_,,}GROUP.VCO","id":3,"_parentId":1,"state":"open"}],"state":"open"}]';
  dashbord_input='';
  constructor() {
    let href_arr = window.location.href.split('?');
    if (href_arr.length > 1) {
      this.dashbord_input = decodeURIComponent(href_arr[1]);
      console.log(this.dashbord_input)
    }


  }

  ngOnInit() {
    var mars_commands = []
    var query_command = ""
    var query_pattern = ""
    var query_pattern_init = ""
    var pattern_options=""
    var groups=[]
    var VCOs=[]
    var submitter=""
    var patterns=[]
    var tot="2019.2"
    var branch="2019.1"
    var query_prefix = "mars_results find_run_submissions -q \""
    this.dashbord_input = this.dashbord_input.slice(0, -1);
    var dashboard_json_input = JSON.parse(this.dashbord_input)
    var vars=dashboard_json_input.extra.vars

    var vals=dashboard_json_input.extra.vals
    console.log(vars)

  dashboard_json_input.query.forEach(dashboard_json => {
    if(dashboard_json.hasOwnProperty('groups')){
      groups = (dashboard_json.groups).split(" ")
      submitter = dashboard_json.user
      VCOs = (dashboard_json.vcos).split(" ")
      patterns = dashboard_json.children
    patterns.forEach(pattern => {

      pattern = pattern.pattern.replace("PRODUCT", dashboard_json.product)
      pattern = pattern.replace(/\${tot}/g, tot)
      pattern = pattern.replace(/\${branch}/g, branch)
      var query_command_template = query_prefix.concat("submitter='"+submitter+"' and build in (version='"+tot+"*') and name='")
      pattern_options = pattern.match(/(?<={)(.*(,.*))*}/g)[0].slice(0,-1)
      var pattern_options=pattern_options.split(",")
      console.log(pattern_options)

      groups.forEach(group => {
        VCOs.forEach(VCO => {
          query_pattern_init=pattern
          query_pattern_init=query_pattern_init.replace(/VCO/g, VCO)
          query_pattern_init=query_pattern_init.replace(/GROUP/g, group)

          pattern_options.forEach(pattern_option => {
            query_pattern=query_pattern_init.replace(/{.*}/g,pattern_option)
            query_command = query_command_template.concat(query_pattern).concat("\'\"\n")
            mars_commands.push(query_command)
        });
      });
    });
  });
    }

  });
    this.mars_commands_list=mars_commands.join("")
  }

}
