import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

import { CoreTranslationService } from '@core/services/translation.service';
import { DispatchService } from 'app/service/dispatch.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'app/auth/service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FournisseurService } from 'app/service/fournisseur.service';
import { Fournisseur } from 'app/Model/fournisseur';
import { Console } from '../../../../Model/console';


@Component({
  selector: 'app-dispatch',
  templateUrl: './dispatch.component.html',
  styleUrls: ['./dispatch.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class DispatchComponent implements OnInit {

  private _unsubscribeAll: Subject<any>;
  private tempData: any;

  // public
  public contentHeader: object;
  public rows: any;
  public selected = [];
  public kitchenSinkRows: any;
  public basicSelectedOption: number = 10;
  public ColumnMode = ColumnMode;
  public expanded = {};
  public editingName = {};
  public editingStatus = {};
  public editingAge = {};
  public editingSalary = {};
  public chkBoxSelected = [];
  public SelectionType = SelectionType;
  public exportCSVData;

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('tableRowDetails') tableRowDetails: any;
  data: any;
  listColisCrees: Console[];
  selectedReferences: any;
  listLivreur: any;
  livreur;
  currentUser: any;
  listFournisseur: Fournisseur[];
  selectedFournisseur: any;

  // snippet code variables

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Inline editing Name
   *
   * @param event
   * @param cell
   * @param rowIndex
   */
  inlineEditingUpdateName(event, cell, rowIndex) {
    this.editingName[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  /**
   * Inline editing Age
   *
   * @param event
   * @param cell
   * @param rowIndex
   */
  inlineEditingUpdateAge(event, cell, rowIndex) {
    this.editingAge[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  /**
   * Inline editing Salary
   *
   * @param event
   * @param cell
   * @param rowIndex
   */
  inlineEditingUpdateSalary(event, cell, rowIndex) {
    this.editingSalary[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  /**
   * Inline editing Status
   *
   * @param event
   * @param cell
   * @param rowIndex
   */
  inlineEditingUpdateStatus(event, cell, rowIndex) {
    this.editingStatus[rowIndex + '-' + cell] = false;
    this.rows[rowIndex][cell] = event.target.value;
    this.rows = [...this.rows];
  }

  /**
   * Search (filter)
   *
   * @param event
   */
   filterUpdate(event) {

    const val = this.selectedFournisseur;
    console.log(val)
    if (val) {
      // filter our data
      const temp = this.tempData.filter(function (d) {
        return d?.fournisseur?.iduser === val;
      });

      // update the rows
      this.listColisCrees = temp;    // Whenever the filter changes, always go back to the first page
      this.table.offset = 0;
    }
    else {
      this.ngOnInit();
    }
  }

  /**
   * Row Details Toggle
   *
   * @param row
   */
  rowDetailsToggleExpand(row) {
    this.tableRowDetails.rowDetail.toggleExpandRow(row);
  }

  /**
   * For ref only, log selected values
   *
   * @param selected
   */
   onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
    this.selectedReferences = this.selected
    console.log(this.selectedReferences)

  }

  /**
   * For ref only, log activate events
   *
   * @param selected
   */
  onActivate(event) {
    // console.log('Activate Event', event);
  }

  /**
   * Custom Chkbox On Select
   *
   * @param { selected }
   */
   customChkboxOnSelect({ selected }) {
    this.chkBoxSelected.splice(0, this.chkBoxSelected.length);
    this.chkBoxSelected.push(...selected);
    this.selectedReferences = this.selected
    console.log(this.selectedReferences)

  }

  /**
   * Constructor
   *
   * @param {DatatablesService} _datatablesService
   * @param {CoreTranslationService} _coreTranslationService
   */
  constructor(private serviceFournisseur: FournisseurService ,private router : Router,private _toastrService: ToastrService, private _authenticationService: AuthenticationService, private modalService: NgbModal, private dispatchService: DispatchService, private _coreTranslationService: CoreTranslationService) {
    this._authenticationService.currentUser.subscribe(x => (this.currentUser = x));

    this._unsubscribeAll = new Subject();
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {
    this.dispatchService.getAllColis().pipe(takeUntil(this._unsubscribeAll)).subscribe((response : any) => {
      this.listColisCrees = response.filter(item=> item.fournisseur.isDeleted === false)
      this.tempData = this.listColisCrees;
      // this.kitchenSinkRows = this.rows;
      // this.exportCSVData = this.rows;
    });
      this.serviceFournisseur.getAllFournisseur().subscribe(
        (response: any) => { this.listFournisseur = response.filter(item=> item.isDeleted === false) }
      )
    
    this.dispatchService.getLivreurList().subscribe(
      (response: any) => { this.listLivreur = response }
    )
    // content header
    this.contentHeader = {
      headerTitle: 'Dispatch',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Dashboard',
            isLink: true,
            link: '/'
          }
        ]
      }
    };
  }
  closeModel() {
    this.modalService.dismissAll();
  }

  openCreateModal(createModel) {
    this.modalService.open(createModel, {
      centered: true,
      size: 'lg'
    });
  }
  onDispatch(form) {
    const body = {
      colisReferences: this.selected.map((item)=>item.reference),
      idDispatcher: this.currentUser.iduser,
      idLivreur: this.livreur
    }
    console.log(body.colisReferences)
    this.dispatchService.dispatch(body).subscribe((data) => {
      this._toastrService.success('Vous avez dispatcher  ' + body.colisReferences.length + ' avec succès ! ',
        'Modification avec succès !', { toastClass: 'toast ngx-toastr', closeButton: true, timeOut: 1000 }).onHidden.subscribe(res => {
          this.closeModel();
          this.router.navigate(['list-dispatch/list-dispatch']);

        });
    })

  }
}
