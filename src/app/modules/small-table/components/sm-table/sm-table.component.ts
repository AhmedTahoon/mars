import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {SelectContainerComponent} from 'ngx-drag-to-select';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {GetJsonService} from '../../../../shared/get-json.service';

@Component({
  selector: 'app-sm-table',
  templateUrl: './sm-table.component.html',
  styleUrls: ['./sm-table.component.css']
})
export class SmTableComponent implements OnInit {
  @Input() tableData = {};
  @Input() columnNames: string[] = [];
  @Input() allTableData = {};
  @Input() allColumnData: any[] = [];
  @Input() rowVisibility = {};
  @Input() test_case_comments = {};
  @Input() comment_test_cases = {};
  heightWindow = "0";
  filteredTable = [];
  curRow: any[] = [];
  isSubTableVisible = false;
  selectedTab = {'i': 0, 'j': 0};
  selectedDocuments = [];
  sortingOrder = {};
  searchMode = false;
  curInput: string = "";
  allConstTable = [];
  tabCounter = 0;
  myIndex = -1;
  JSONstringify = JSON.stringify;
  objectKeys = Object.keys;
  newWindowBaseUrl = 'http://regweb/regression_web/php/browse_php/browse_multi.php?';

  @ViewChild('selectContainer') selectContainer: SelectContainerComponent;

  constructor(private modalService: NgbModal, private _getJsonService: GetJsonService) {
    this.heightWindow = (window.innerHeight - 110).toString();
  }

  ngOnInit() {
    this.updateSmallTable(true, 0);
  }

  deselectAll() {
    this.selectContainer.clearSelection();
  }

  public setTestSelected(row) {
    this.myIndex = -1;
    this.selectContainer.selectItems((item) => {
      return item.hasOwnProperty('test') === true && item['test'] === row;
    });
  }

  public setCommentSelected(test) {
    this.selectContainer.selectItems((item) => {
      return item.hasOwnProperty('comment') === true && item['comment'] === test;
    });
  }

  public setDEISelected(test) {
    this.selectContainer.selectItems((item) => {
      return item.hasOwnProperty('dei') === true && item['dei'] === test;
    });
  }
  public setStatusSelected(row, id) {
    this.myIndex = id;
    this.selectContainer.selectItems((item) => {
     // console.log(item.hasOwnProperty('status') === true && item['status'] === row && item['id'] === id);
      return item.hasOwnProperty('status') === true && item['status'] === row && item['id'] === id;
    });
  }

  public openTestExplorerWindow(testName) {
    let selectedStatus = this.selectedDocuments.filter(item => item.hasOwnProperty('status'));
    let args = "";
    if (selectedStatus.length === 0) {
      args += "dirs[]=" + this.allTableData[testName][0]['exec_gpath'].slice(3) + '&';
    }
    for (let i in selectedStatus) {
      let idx = -1;
      for (let j in this.allTableData[selectedStatus[i]['testName']]) {
        if (this.allTableData[selectedStatus[i]['testName']][j] !== null &&
          this.allTableData[selectedStatus[i]['testName']][j] !== undefined) {
          idx = Number(j);
          break;
        }
      }
      if (idx === -1)
        continue;
      args += "dirs[]=" + this.allTableData[selectedStatus[i]['testName']][idx]['exec_gpath'].slice(3) + '&';
    }
    window.open(this.newWindowBaseUrl + args, "_blank");
  }

  public showMessage(message) {
    console.log("Message: ", message);
    this.deselectAll();
  }

  // this function is responsible for hiding the pop up sub-table *that contains all info of the row* and also the context menu
  hideAllPopUps() {
    this.isSubTableVisible = false;
    this.isShowCommentsMode = false;
    this.isShowDEIsMode = false;
    this.deselectAll();
  }

  // this function responsible for showing the pop up sub-table
  tabs = [];

  showPopUpTableTest(testName) {
    this.isSubTableVisible = true;
    this.curRow = this.allTableData[testName];
    let cnt = 0;
    this.tabs = [];
    let selectedTests = this.selectedDocuments.filter(item => item.hasOwnProperty('test'));
    for (let i in selectedTests) {
      for (let j in selectedTests[i]['test']['Data']) {
        if (selectedTests[i]['test']['Data'][j]['exec_state'] !== 'NO STATUS') {
          this.tabs.push({'testName': selectedTests[i]['test']['Tests'], 'val': "Tab " + (++cnt), 'i': Number(i), 'j': Number(j)});
        }
      }
    }
    let once = true;
    for (let i in this.curRow) {
      if (this.curRow[i]['exec_state'] !== 'NO STATUS' && once) {
        this.selectedTab = {'i': 0, 'j': Number(i)};
        once = false;
        if (selectedTests.length === 0) {
          this.tabs.push({'testName': testName, 'val': "Tab " + (++cnt), 'i': 0, 'j': Number(i)});
        }
      }
    }
    this.tabCounter = 0;
  }

  showPopUpTableStatus(testName) {
    this.isSubTableVisible = true;
    this.curRow = this.allTableData[testName];
    let cnt = 0;
    this.tabs = [];
    let selectedStatus = this.selectedDocuments.filter(item => item.hasOwnProperty('status'));
    let ID = -1;
    for (let i in selectedStatus) {
      for (let j in selectedStatus[i]['status']['Data']) {
        if (selectedStatus[i]['status']['Data'][j]['exec_state'] !== 'NO STATUS' && selectedStatus[i]['id'] === Number(j)) {
          if (ID === -1)
            ID = selectedStatus[i]['id'];
          this.tabs.push({'testName': selectedStatus[i]['status']['Tests'], 'val': "Tab " + (++cnt), 'i': Number(i), 'j': Number(j)});
        }
      }
    }
    let once = true;
    for (let i in this.curRow) {
      if (this.curRow[i]['exec_state'] !== 'NO STATUS' && (ID === -1 || ID === Number(i)) && once) {
        this.selectedTab = {'i': 0, 'j': Number(i)};
        once = false;
        if (selectedStatus.length === 0) {
          this.tabs.push({'testName': testName, 'val': "Tab " + (++cnt), 'i': 0, 'j': Number(i)});
        }
      }
    }
    this.tabCounter = 0;
  }

  changeSortingOrder(colIndex: number) {
    if (this.sortingOrder[colIndex] === "▼") {
      this.sortingOrder[colIndex] = "▲";
      this.updateSmallTable(false, colIndex);
    } else {
      this.sortingOrder[colIndex] = "▼";
      this.updateSmallTable(true, colIndex);
    }
  }

  enableSearchMode() {
    this.searchMode = true;
  }

  disableSearchMode() {
    this.searchMode = false;
    this.filteredTable = this.allConstTable;
    this.curInput = "";
  }

  applyChange() {
    if (this.curInput === "") return;
    this.filteredTable = this.allConstTable.filter(item => item['Tests'].indexOf(this.curInput) !== -1);
  }

  public updateSmallTable(order, indxCol) {
    console.log("Updating small table");
    this.filteredTable.length = 0;
    // order = true means increasing, false means decreasing
    for (let key in this.tableData) {
      let allTrue = false;
      for (let index in this.tableData[key]) {
        let subTrue = false;
        for (let fs in this.tableData[key][index]["fstatus"]) {
          subTrue = subTrue || (this.rowVisibility["fstatus"][this.tableData[key][index]["fstatus"][fs]] === true);
        }
        allTrue = allTrue || (this.rowVisibility["exec_state"][this.tableData[key][index]["exec_state"]] === true && subTrue);
      }
      if (allTrue)
        this.filteredTable.push({"Tests": key, "Data": this.tableData[key]});
    }
    if (indxCol === 0) {
      this.filteredTable = this.testSort(order, this.filteredTable);
    } else if (indxCol >= 1) {
      this.filteredTable = this.statusSort(order, this.filteredTable, indxCol - 1);
    }
    this.allConstTable = this.filteredTable;
    return this.filteredTable;
  }

  private testSort(order: boolean, newArr: any[]) {
    newArr.sort();
    if (!order) {
      newArr.reverse();
    }
    return newArr;
  }

  private statusSort(order: boolean, newArr: any[], statusIndex: number) {
    newArr.sort(function (a: string, b: string) {
      return a['Data'][statusIndex]['exec_state'] < b['Data'][statusIndex]['exec_state'] ? -1 : 1;
    });
    if (!order) {
      newArr.reverse();
    }
    return newArr;
  }
  // a recursive function for displaying table
  // arrays displayed in list
  // json diplayes in table
  displayContent(value) {
    if (Array.isArray(value) === true) {
      let res = "<ul class=\"list-group custom-list\">\n";
      value.forEach( (item) => {
        if (typeof item === 'object') {
          item = this.displayContent(item);
        } else if (item === null || item === undefined) item = "---";
        res += "<li class=\"list-group-item\" *ngFor=\"let cur_DEI of objectKeys(shownDEIs[cur_tab])\">\n" + item + "</li>\n";
      });
      res += "</ul>";
      return res;
    } else if (typeof value === 'object') {
      let res = "<table  class=\"table table-striped\">";
      for (let key in value) {
        let item = value[key];
        if (typeof item === 'object') {
          item = this.displayContent(item);
        } else if (item === null || item === undefined) item = "---";
        res += "<tr> <th>" + key + "</th> <td>" + item + "</td> </tr>";
      }
      res += "</table>";
      return res;
    } else if (value === null || typeof value === 'undefined') {
      return "---";
    }
    return value;
  }

  showError = false;
  loading = false;
  errorResult = "Please fill all fields";
  shownComments = [];
  shownTestCases = []; // shown test cases in the comments window
  isShowCommentsMode = false;
  isAttachTestCasesMode_comments = false;
  showInputs = {};
  commentOperation = {};
  showCommentErrors = {};
  errorCommentMsg = "";
  checkedComments = {};
  attachComments = [];
  attachError = false;
  attachErrorMsg = "Selected Comment(s) didn't Attach Successfully to Selected Test Case(s). Please Try again!";
  attach_user = "";
  submittedAttach = false;
  isLoadingAttach = false;
  del_option = 1;
  getCommentsNumber(testName) {
    let cnt = 0;
    for (let testCaseCommentKey in this.test_case_comments[testName]) {
      cnt += this.test_case_comments[testName][ testCaseCommentKey ].length;
    }
    return (cnt === 0? "-": cnt + " Comments");
  }
  showComment() {
    this.isShowCommentsMode = true;
    this.shownComments = [];
    let selectedComments = this.selectedDocuments.filter(item => item.hasOwnProperty('comment') === true);
    for (let selected in selectedComments) {
      let test_name = selectedComments[selected]['comment'];
      this.shownComments.push(this.test_case_comments[test_name]);
      this.shownTestCases.push(test_name);
      for (let selected_status in this.test_case_comments[ test_name ]) {
        if (this.showInputs.hasOwnProperty(selected) === false) this.showInputs[selected] = {};
        if (this.commentOperation.hasOwnProperty(selected) === false) this.commentOperation[selected] = {};
        if (this.showCommentErrors.hasOwnProperty(selected) === false) this.showCommentErrors[selected] = {};
        for (let selected_comm in this.test_case_comments[ test_name ][ selected_status ]) {
          if (this.showInputs[selected].hasOwnProperty(selected_status) === false) this.showInputs[selected][selected_status] = {};
          if (this.commentOperation[selected].hasOwnProperty(selected_status) === false) this.commentOperation[selected][selected_status] = {};
          if (this.showCommentErrors[selected].hasOwnProperty(selected_status) === false) this.showCommentErrors[selected][selected_status] = {};
          this.commentOperation[selected][selected_status][selected_comm] = "normal";
          this.showInputs[selected][selected_status][selected_comm] = false;
          this.showCommentErrors[selected][selected_status][selected_comm] = false;
        }
      }
    }
  }
  attachCommentModal(attach_comment) {
    this.attachComments = [];
    let commentMap = {}; // filter test_case_comments to get rid of duplicates
    let selectedComments = this.selectedDocuments.filter(item => item.hasOwnProperty('comment') === true); // list contains test cases that has all test_case_comments
    for (let selected in selectedComments) {
      let curTestCase = this.test_case_comments[ selectedComments[selected]['comment'] ]; // getting test_case_comments of the current test case
      for (let status in curTestCase) {
        for (let comm in curTestCase[status]) {
          if (commentMap.hasOwnProperty(curTestCase[status][comm]['id']) === false) {
            commentMap[ curTestCase[status][comm]['id'] ] = true;
            this.attachComments.push( curTestCase[status][comm] );
          }
        }
      }
    }
    this.attachCommentList(attach_comment);
  }
  attachCommentSubmission(modal, att_user: string) {
    // in this step I've already chosen the test_case_comments and It's time to choose test cases
    console.log(att_user);
    console.log(this.checkedComments);
    if (att_user === '' || Object.values(this.checkedComments).indexOf(true) === -1) {
      this.attachError = true;
      this.attachErrorMsg = "Please fill all fields";
      return;
    }
    this.attachError = false;
    this.attach_user = att_user;
    this.isAttachTestCasesMode_comments = true;
    modal.close();
  }
  sendAttachedTestCases(mode: boolean) { // mode => true: comment, false: dei
    this.isAttachTestCasesMode_comments = false;
    this.isAttachTestCasesMode_deis = false;

    this.isLoadingAttach = true;
    let selectedTestCases = this.selectedDocuments.filter((item) => item.hasOwnProperty('status') === true);
    let test_case_ids = [];
    for (let selected in selectedTestCases) {
      let testName = selectedTestCases[selected]['testName'];
      let statusIndex = selectedTestCases[selected]['id'];
      test_case_ids.push(this.allTableData[ testName ][ statusIndex ]['id']);
    }
    if (mode == true) {
      // comment
      this.sendAttachedTestCases_comment(test_case_ids, selectedTestCases);
    } else {
      // dei
      this.sendAttachedTestCases_dei(test_case_ids, selectedTestCases);
    }
  }
  sendAttachedTestCases_comment(test_case_ids, selectedTestCases) {
    let note_ids = [];
    let checkedCommentsData = [];
    for (let selected in this.attachComments) {
      if (this.checkedComments[selected] === true) {
        note_ids.push(this.attachComments[selected]['id']);
        checkedCommentsData.push(this.attachComments[selected]);
      }
    }
    let params = {
      "note_ids": note_ids,
      "test_instance_ids": test_case_ids,
      "actor": this.attach_user
    };
    this._getJsonService.attachNotes(params).subscribe((data) => {
      this.isLoadingAttach = false;
      if (data.hasOwnProperty("result") && data["result"] === "OK") {
        // success
        console.log("Comments Attached =D");
        this.submittedAttach = true;
        this.attachError = false;
        // attach these test_case_comments to selected test cases on the UI
        for (let test_case in selectedTestCases) {
          let testName = selectedTestCases[test_case]['testName'];
          let statusIndex = selectedTestCases[test_case]['id'];
          checkedCommentsData.forEach(item => {
            let found = false;
            if (!this.test_case_comments.hasOwnProperty(testName)) this.test_case_comments[testName] = {};
            if (!this.test_case_comments[testName].hasOwnProperty(statusIndex)) this.test_case_comments[testName][statusIndex] = [];
            this.test_case_comments[testName][statusIndex].forEach(node => {
              if (node['id'] === item['id']) found = true;
            });
            if (!found) {
              this.test_case_comments[testName][statusIndex].push(item);
            }
          });
        }
        this.deselectAll();
      } else {
        // error
        console.log("ERROR", data);
        this.attachError = true;
        this.submittedAttach = false;
        this.attachErrorMsg = "Selected Comment(s) didn't Attach Successfully to Selected Test Case(s). Please Try again!";
        this.isLoadingAttach = false;
      }
    }, error1 => {
      // error
      console.log("ERROR", error1);
      this.attachError = true;
      this.submittedAttach = false;
      this.attachErrorMsg = "Selected Comment(s) didn't Attach Successfully to Selected Test Case(s). Please Try again!";
      this.isLoadingAttach = false;
    });
  }
  sendComment(txt_val, user_val, selectedComments, modal) {
    console.log("HELLO1", selectedComments);
    let selected_ids = []; // selected test cases ids
    for (let selected in selectedComments) {
      let testName = selectedComments[selected]['testName'];
      console.log("HELLO", selectedComments[selected]['testName'], this.allTableData[ testName ][ selectedComments[selected]['id'] ]);
      selected_ids.push(this.allTableData[ testName ][ selectedComments[selected]['id'] ]['id']);
    }
    let params = {
      "note": {
        'creator': user_val,
        'type': 'GENERAL',
        'content': txt_val
      },
      "attached_test_instance_ids": selected_ids
    };
    this._getJsonService.createNote(params).subscribe(data => {
      console.log(data);
      // if the request is successful then close the modal
      if (data.hasOwnProperty("result") && data["result"] === "OK") {
        // add test_case_comments to the table
        this.comment_test_cases[ data['content'] ] = [];
        for (let selected in selectedComments) {
          let testName = selectedComments[selected]['testName'];
          let status_index = selectedComments[selected]['id'];
          if (!this.test_case_comments.hasOwnProperty(testName)) {
            this.test_case_comments[testName] = {};
          }
          if (!this.test_case_comments[testName].hasOwnProperty(status_index)) {
            this.test_case_comments[testName][status_index] = [];
          }
          this.test_case_comments[testName][status_index].push({
            'content': txt_val,
            'id': data['content'],
            'type': 'GENERAL',
            'creator': user_val
          });
          this.comment_test_cases[ data['content'] ].push({ 'test_name': testName, 'status_index': status_index });
        }
        modal.close();
      } else {
        console.log("ERROR", data);
        this.showError = true;
        this.errorResult = "Please, Make sure that the entered data is correct!";
      }
      this.loading = false;
    }, error1 => {
      console.log("ERROR", error1);
      this.showError = true;
      this.errorResult = "Please, Make sure that the entered data is correct!";

      this.loading = false;
    });
  }
  addNewComment(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then(() => {
      this.deselectAll();
      this.showError = false;
    }, () => {
      console.log(`Dismissed`);
      this.showError = false;
    });
  }
  attachCommentList(attach_comment) {
    for (let selected in this.attachComments) { // empty checked test_case_comments
      this.checkedComments[selected] = false;
    }
    this.modalService.open(attach_comment, {ariaLabelledBy: 'modalComm-basic-title'}).result.then(() => {
      this.deselectAll();
    }, () => {
      console.log(`Dismissed`);
    });
  }
  commentSubmission(modal, txt_val, user_val) {
    // submit new comment
    if (txt_val === '' || user_val === '') {
      this.errorResult = "Please fill all fields";
      this.showError = true;
      return;
    }
    // *show loader to indicate that there's some processing*
    this.loading = true;
    let selectedComments = this.selectedDocuments.filter(item => item.hasOwnProperty('status') === true);
    this.sendComment(txt_val, user_val, selectedComments, modal);
    this.showError = false;
  }
  updateCommentMode(cur_tab, cur_status, cur_comment) {
    // shows the inputs to edit the comment content
    if (this.showInputs[cur_tab][cur_status][cur_comment] === false) { // begin editing mode
      this.commentOperation[cur_tab][cur_status][cur_comment] = "submit";
      this.showInputs[cur_tab][cur_status][cur_comment] = true;
    } else { // submit edits
      this.commentOperation[cur_tab][cur_status][cur_comment] = "loadingUpdate";
      console.log(this.shownComments[cur_tab][cur_status][cur_comment]['content']);
      this.updateCommentContent({
        "note_id": this.shownComments[cur_tab][cur_status][cur_comment]['id'],
        "content": this.shownComments[cur_tab][cur_status][cur_comment]['content'],
        "actor": this.shownComments[cur_tab][cur_status][cur_comment]['creator']
      }, cur_tab, cur_status, cur_comment);
    }
  }
  updateCommentContent(params, cur_tab, cur_status, cur_comment) {
    // sending updates to the service
    this._getJsonService.updateNote(params).subscribe(data => {
      if (data.hasOwnProperty("result") && data["result"] === "OK") {
        // success
        console.log("Comment Updated =D");
        this.commentOperation[cur_tab][cur_status][cur_comment] = "normal";
        this.showInputs[cur_tab][cur_status][cur_comment] = false;
        this.showCommentErrors[cur_tab][cur_status][cur_comment] = false;
      } else {
        console.log(data);
        this.commentOperation[cur_tab][cur_status][cur_comment] = "submit";
        this.showCommentErrors[cur_tab][cur_status][cur_comment] = true;
        this.errorCommentMsg = "There's an error in updating comment content. Please, check your internet connection!";
      }
    }, (error1) => {
      console.log(error1);
      this.commentOperation[cur_tab][cur_status][cur_comment] = "submit";
      this.showCommentErrors[cur_tab][cur_status][cur_comment] = true;
      this.errorCommentMsg = "There's an error in updating comment content. Please, check your internet connection!";
    });
  }
  openDeleteCommentOrDEIModal(delete_comment_modal, cur_tab, cur_status, cur_comment_or_dei) {
    this.modalService.open(delete_comment_modal, {ariaLabelledBy: 'modalDel-basic-title'}).result.then((del_user_val) => {
      this.deselectAll();

      if (this.isShowCommentsMode)
        this.deleteComment(cur_tab, cur_status, cur_comment_or_dei, del_user_val, this.del_option === 2);
      else this.deleteDEI(cur_tab, cur_status, cur_comment_or_dei, del_user_val, this.del_option === 2);

      this.showError = false;
    }, () => {
      console.log(`Dismissed`);
      this.showError = false;
    });
  }
  deleteComment(cur_tab, cur_status, cur_comment, del_user_val, allow_detach_all) {
    // sending detach one comment from one test case to the service
    this.commentOperation[cur_tab][cur_status][cur_comment] = "loadingDelete";
    let comment_id = this.shownComments[cur_tab][cur_status][cur_comment]['id'];
    let test_id = this.allTableData[ this.shownTestCases[cur_tab] ][ cur_status ]['id'];
    let params = {
      "actor": del_user_val,
      "note_ids": [comment_id],
      "test_instance_ids": allow_detach_all? [] : [test_id],
      "allow_detach_all": allow_detach_all
    };
    this._getJsonService.detachNotes(params).subscribe(data => {
      if (data.hasOwnProperty("result") && data["result"] === "OK") {
        // success
        console.log("Comment detached =D");
        if (allow_detach_all) {
          // detach from all test cases
          let test_names = this.comment_test_cases[comment_id];
          test_names.forEach( (item) => {
            let test_name = item['test_name'];
            let status_index = item['status_index'];
            let comment_pos = this.test_case_comments[test_name][status_index].findIndex(v => v.id === comment_id);
            this.test_case_comments[test_name][status_index].splice(comment_pos, 1);
          });
        } else {
          // detach from current test case only
          this.shownComments[cur_tab][cur_status].splice(Number(cur_comment), 1);
        }
        this.showCommentErrors[cur_tab][cur_status][cur_comment] = false;
        this.commentOperation[cur_tab][cur_status][cur_comment] = "normal";
      } else {
        console.log(data);
        // error
        this.showCommentErrors[cur_tab][cur_status][cur_comment] = true;
        this.commentOperation[cur_tab][cur_status][cur_comment] = "normal";
        this.errorCommentMsg = "There's an error in deleting comment. Please, check your internet connection!";
      }
    }, (error1) => {
      console.log(error1);
      // error
      this.showCommentErrors[cur_tab][cur_status][cur_comment] = true;
      this.commentOperation[cur_tab][cur_status][cur_comment] = "normal";
      this.errorCommentMsg = "There's an error in deleting comment. Please, check your internet connection!";
    });

  }
//  DEI Operations
  shownDEIs = [];
  isShowDEIsMode = false;
  DEIOperation = {};
  showDEIErrors = {};
  errorDEIMsg = "";
  attachDEIs = [];
  checkedDEIs = {};
  attachDEIError = false;
  attach_dei_user = "";
  isAttachTestCasesMode_deis = false;
  @Input() test_case_DEIs = {};
  getDEIsNumber(testName) {
    let cnt = 0;
    for (let test_case_DEIKey in this.test_case_DEIs[testName]) {
      cnt += this.test_case_DEIs[testName][ test_case_DEIKey ].length;
    }
    return (cnt === 0? "No DEIs": cnt + " DEIs");
  }
  showDEI() {
    this.isShowDEIsMode = true;
    this.shownDEIs = [];
    let selectedDEIs = this.selectedDocuments.filter(item => item.hasOwnProperty('dei') === true);
    this.shownTestCases = [];
    for (let selected in selectedDEIs) {
      let test_name = selectedDEIs[selected]['dei'];
      this.shownDEIs.push(this.test_case_DEIs[test_name]);
      this.shownTestCases.push(test_name);
      if (!this.showDEIErrors.hasOwnProperty(selected)) this.showDEIErrors[selected] = {};

      for (let selected_status in this.test_case_DEIs[ test_name ]) {
        this.showDEIErrors[selected][selected_status] = false;
        if (this.DEIOperation.hasOwnProperty(selected) === false) this.DEIOperation[selected] = {};

        for (let selected_dei in this.test_case_DEIs[ test_name ][ selected_status ]) {
          if (this.DEIOperation[selected].hasOwnProperty(selected_status) === false) this.DEIOperation[selected][selected_status] = {};

          this.DEIOperation[selected][selected_status][selected_dei] = "normal";
        }
      }
    }
  }
  deleteDEI(cur_tab, cur_status, cur_dei, del_user, allow_detach_all) {
    this.DEIOperation[cur_tab][cur_status][cur_dei] = "loadingDEIDelete";
    let dei_id = this.shownDEIs[cur_tab][cur_status][cur_dei];
    let test_id = this.allTableData[ this.shownTestCases[cur_tab] ][ cur_status ]['id'];
    let params = {
      "actor": del_user,
      "note_ids": [dei_id],
      "test_instance_ids": allow_detach_all? [] : [test_id],
      "allow_detach_all": allow_detach_all
    };
    this._getJsonService.detachDEI(params).subscribe(data => {
      if (data.hasOwnProperty("result") && data["result"] === "OK") {
        // success
        console.log("DEI detached =D");
        if (allow_detach_all) {
          // detach from all test cases
          // let test_names = this.comment_test_cases[dei_id];
          // test_names.forEach( (test_name) => {
          //   let comment_pos = this.test_case_comments[test_name].findIndex(v => v.id === comment_id);
          //   this.test_case_comments[test_name].splice(comment_pos, 1);
          // });
        } else {
          // detach from current test case only
          this.shownDEIs[cur_tab][cur_status].splice(Number(cur_dei), 1);
        }
      } else {
        console.log(data);
        // error
        this.showDEIErrors[cur_tab][cur_status] = true;
        this.DEIOperation[cur_tab][cur_status][cur_dei] = "normal";
        this.errorDEIMsg = "There's an error in deleting DEI. Please, check your internet connection!";
      }
    }, error1 => {
      console.log(error1);
      // error
      this.showDEIErrors[cur_tab][cur_status] = true;
      this.DEIOperation[cur_tab][cur_dei] = "normal";
      this.errorDEIMsg = "There's an error in deleting DEI. Please, check your internet connection!";
    });
  }

  attachDEIModal(attach_dei) {
    this.attachDEIs = [];
    let deiMap = {}; // filter test_case_deis to get rid of duplicates
    let selectedDEIs = this.selectedDocuments.filter(item => item.hasOwnProperty('dei') === true); // list contains test cases that has all test_case_comments
    for (let selected in selectedDEIs) {
      let curTestCase = this.test_case_DEIs[ selectedDEIs[selected]['dei'] ]; // getting test_case_DEIs of the current test case
      for (let status in curTestCase) {
        for (let dei in curTestCase[status]) {
          if (deiMap.hasOwnProperty(curTestCase[status][dei]) === false) {
            deiMap[ curTestCase[status][dei] ] = true;
            this.attachDEIs.push( curTestCase[status][dei] );
          }
        }
      }
    }
    this.attachDEIList(attach_dei);
  }
  attachDEIList(attach_dei) {
    for (let selected in this.attachDEIs) { // empty checked test_case_comments
      this.checkedDEIs[selected] = false;
    }
    this.modalService.open(attach_dei, {ariaLabelledBy: 'modalDEI-basic-title'}).result.then(() => {
      this.deselectAll();
    }, () => {
      console.log(`Dismissed`);
    });
  }
  attachDEISubmission(modal, att_dei_user: string) {
    // in this step I've already chosen the test_case_comments and It's time to choose test cases
    console.log(att_dei_user);
    console.log(this.checkedDEIs);
    if (att_dei_user === '' || Object.values(this.checkedDEIs).indexOf(true) === -1) {
      this.attachError = true;
      this.attachErrorMsg = "Please fill all fields";
      return;
    }
    this.attachDEIError = false;
    this.attach_dei_user = att_dei_user;
    this.isAttachTestCasesMode_deis = true;
    modal.close();
  }
  sendAttachedTestCases_dei(test_case_ids, selectedTestCases) {
    let params = {
      "dei_gids": this.attachDEIs,
      "test_instance_ids": test_case_ids,
      "actor": this.attach_dei_user
    };
    this._getJsonService.attachDEI(params).subscribe((data) => {
      this.isLoadingAttach = false;
      if (data.hasOwnProperty("result") && data["result"] === "OK") {
        // success
        console.log("DEIs Attached =D");
        this.submittedAttach = true;
        this.attachError = false;
        // attach these test_case_comments to selected test cases on the UI
        for (let test_case in selectedTestCases) {
          let testName = selectedTestCases[test_case]['test']['Tests'];
          this.attachDEIs.forEach(item => {
            if(this.test_case_DEIs[testName].indexOf(item) === -1) this.test_case_DEIs[testName].push(item);
          });
        }
        this.deselectAll();
      } else {
        // error
        console.log("ERROR", data);
        this.attachError = true;
        this.submittedAttach = false;
        this.attachErrorMsg = "Selected DEI(s) didn't Attach Successfully to Selected Test Case(s). Please Try again!";
        this.isLoadingAttach = false;
      }
    }, error1 => {
      // error
      console.log("ERROR", error1);
      this.attachError = true;
      this.submittedAttach = false;
      this.attachErrorMsg = "Selected DEI(s) didn't Attach Successfully to Selected Test Case(s). Please Try again!";
      this.isLoadingAttach = false;
    });
  }

//  Update Test Instances
  inputs_upd_tests = [{'key': "Actor", 'val': ""}, {'key': "Evaluation Owner", 'val': ""}];
  radio_upd_tests_ev_status = ["READY ", "IN_PROGRESS", "COMPLETE", "PENDING"];
  ev_status_option = "";
  radio_upd_tests_ev_res = ["NOT_EVALUATED ", "FAIL", "EXPECTED_FAIL", "WAIVED", "BROKEN_TEST", "VALIDATED"];
  ev_res_option = "";
  updateTestsloading = false;
  updateTestInstancesModal(modal) {
    this.modalService.open(modal, {ariaLabelledBy: 'modalUpdateTest-basic-title'}).result.then(() => {
      this.deselectAll();
    }, () => {
      console.log(`Dismissed`);
    });
  }
  sendUpdatedTestInstances(modalUpdateTest) {
    this.updateTestsloading = true;
    for (let inp in this.inputs_upd_tests) {
      if (inp['val'] === '') {
        this.errorResult = "Please fill all fields";
        this.showError = true;
        this.updateTestsloading = false;
        return;
      }
    }
    this.showError = false;
    let selectedTests = [];
    this.selectedDocuments.forEach(item => {
      if (item.hasOwnProperty('status') === true)
        selectedTests.push( this.allTableData[ item['testName'] ][ item['id'] ]['id'] );
    }); // list contains selected test cases
    let params = {
      "actor": this.inputs_upd_tests[0]['val'],
      "test_instance_ids": selectedTests,
      "evaluation_owner": this.inputs_upd_tests[1]['val'],
      "evaluation_status": this.ev_status_option,
      "evaluation_result": this.ev_res_option
    };
    this._getJsonService.updateTests(params).subscribe(data => {
      if (data.hasOwnProperty('result') && data['result'] === "OK") {
        // success
        this.selectedDocuments.forEach(item => {
          if (item.hasOwnProperty('status') === true) {
            this.allTableData[ item['testName'] ][ item['id'] ]['evaluation_owner'] = this.inputs_upd_tests[1]['val'];
            this.allTableData[ item['testName' ]] [item['id'] ]['evaluation_status'] = this.ev_status_option;
            this.allTableData[ item['testName'] ] [item['id'] ]['evaluation_result'] = this.ev_res_option;
          }
        }); // list contains selected test cases
        this.updateTestsloading = false;
        modalUpdateTest.close();
      } else {
        console.log("ERROR", data);
        this.errorResult = "Updating test status failed, Please check your internet connection!";
        this.showError = true;
        this.updateTestsloading = false;
      }
    }, error1 => {
      console.log("ERROR", error1);
      this.errorResult = "Updating test status failed, Please check your internet connection!";
      this.showError = true;
      this.updateTestsloading = false;
    });
  }
//  -------------------------------------------------------------------------
//  Test Context Menu
  public applyColor() {
    // body
  }
  public showHistory() {
    // body
  }
  public copyTestNames() {
    // body
  }
  public hideTest() {
    // body
  }
//  -------------------------------------------------------------------------
//  Status Context Menu
  public selectColorTagGreen() {
    // body
  }
  public selectColorTagYellow() {
    // body
  }
  public selectColorTagRed() {
    // body
  }
  public openTestExplorer() {
    // body
  }
  public gridJobStatus() {

  }
  public viewQLog() {
    let selectedTests = [];
    let str='';
    this.selectedDocuments.forEach(item => {
      if (item.hasOwnProperty('status') === true)
      var re = /wv:/gi;
      var path=this.allTableData[ item['testName'] ][0]['grid_job']['stdout_gpath']
      console.log(path);
      var path = path.replace(re, '' );
      path='files[]='+path;
      path=path+'&';
      str+=path;

    });
    window.open('http://regweb.wv.mentorg.com/regression_web/php/browse_php/browse_multi.php?'+str);
  }
  public monitorQLog() {

  }
  public killSelectedJobs() {

  }
  public runCommandOpenTerminal() {

  }
  public runCommandOpenTerminalQuick() {

  }
  public copyFailReasonsToTags() {

  }
  public openClickBuild() {

  }
  public openVNC() {

  }
}
