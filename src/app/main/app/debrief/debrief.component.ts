
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreTranslationService } from '@core/services/translation.service';
import { HubService } from 'app/service/hub.service';
import { Hub } from 'app/Model/hub';
import { SocieteLiv } from 'app/Model/societeLiv';
import { SocieteLivService } from 'app/service/societeLiv.service';
import { ConsoleService } from 'app/service/console.service';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import * as snippet from 'app/main/extensions/swiper/swiper.snippetcode';
import { DebriefService } from 'app/service/debrief.service';
import * as _ from 'lodash'
import { AuthenticationService } from 'app/auth/service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-debrief',
  templateUrl: './debrief.component.html',
  styleUrls: ['./debrief.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DebriefComponent implements OnInit {
  private _unsubscribeAll: Subject<any>;//
  private tempData = [];//
  public contentHeader: object;
  public rows: any;//
  public selected = [];
  public listHub: any;//
  public basicSelectedOption: number = 10;
  public ColumnMode = ColumnMode;
  public expanded = {};
  public exportCSVData;//
  public displayForm: boolean = false;

  public editHub: Hub;
  public deleteHub: Hub;
  public selectMulti;
  public centeredSlideIndex = 2;
  public swiperMultiple: SwiperConfigInterface = {
    slidesPerView: 'auto',
    spaceBetween: 30,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }
  };
  totalCodColisLivre = 0;
  public _snippetCodeSwiperCenteredSlides1 = snippet.snippetCodeSwiperCenteredSlides1;
  public swiperswiperCenteredSlides: SwiperConfigInterface = {
    slidesPerView: 1,
    centeredSlides: false,
    spaceBetween: 30,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    }
  };
  hubList;
  public selectMultiSelected = [];


  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild("encours") encours: DatatableComponent;
  @ViewChild("planification") planification: DatatableComponent;
  @ViewChild("enAttente") enAttenteDEnlevementdt: DatatableComponent;
  @ViewChild("modalDraft") modalDraft: NgbModal;
  @ViewChild("modalDebrief") modalDebrief: NgbModal;
  @ViewChild('tableRowDetails') tableRowDetails: any;
  selectedHub: any;
  selectLivreur: any;
  selectedLivreur: any;
  selectedRunsheet: any;
  selectRunsheet: any;
  enCoursDeLivraison: any = [];
  colisList: any;
  enCoursDeLivraisonTotal: any;
  barCodeColis: any;
  colisDetails: any;
  displayAnomalie: boolean = false;
  anomalies: any;
  enAttenteDEnlevement: any = [];
  enAttenteDEnlevementTotal: number = 0;
  planificationRetour: any = [];
  planificationRetourTotal: number = 0;
  planificationRetourEchangeTotal: any;
  planificationRetourEchange = [];
  anomaly: any;
  enCoursDeLivraisonPrixTotal = 0;
  planificationRetourPrixTotal = 0;
  enAttenteDEnlevementPrixTotal = 0;
  planificationRetourEchangePrixTotal = 0;
  selectedenCoursDeLivraison = [];
  public SelectionType = SelectionType;
  selectedPR = [];
  selectedPickup = [];

  selectedPlanificationRetour = [];
  tableRefEncous: any;
  selectedPickupList = [];
  currentUser: any;
  validator: number;
  isUpdate = false;
  totalCODColisLivreTotal: number = 0;

  /**
   * Constructor
   *
   * @param {DatatablesService} _datatablesService
   * @param {CoreTranslationService} _coreTranslationService
   * @param {ToastrService} _toastrService
   */

  constructor(private router: Router, private hubService: HubService, private modalService: NgbModal, private debriefService: DebriefService,
    private _datatablesService: HubService, private societeLivraisonService: SocieteLivService,
    private _coreTranslationService: CoreTranslationService,
    private _authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private _toastrService: ToastrService,) {
    this._authenticationService.currentUser.subscribe(x => (this.currentUser = x));
    this.validator = this.currentUser.iduser
    this._unsubscribeAll = new Subject();
  }
  /**
   * Search (filter)
   *
   * @param event
   */
  filterUpdate(event) {

    const val = event.target.value.toLowerCase();
    if (val != "") {
      // filter our data
      const temp = this.tempData.filter(function (d) {
        return d.gouvernorat.toLowerCase().startsWith(val) || d.titre.toLowerCase().startsWith(val) || d.gouvernorat_lie.forEach(item => { item.toLowerCase().startsWith(val) });
      });

      // update the rows
      this.listHub = temp;
      // Whenever the filter changes, always go back to the first page
      this.table.offset = 0;
    }
    else {
      this.ngOnInit();
    }
  }

  ngOnInit() {
    this.param = this.route.snapshot.queryParams['debrief'];
    this.isUpdate = this.param ? true : false;
    if (this.param) {
      this.debriefService.findDebriefById(this.param).subscribe(data => {
        console.log(data.livreur)
        this.selectedLivreur = data.livreur;
        console.log(data.hub)
        this.selectedRunsheet = data.colis[0].runsheet;
        this.selectedHub = data.colis[0]?.hub;
        this.colisList = data.colis.filter((item) => item.debriefed === false);
        this.enCoursDeLivraisonTotal = this.colisList.filter((item) => item.etat === "enCoursDeLivraison").length;
        this.enCoursDeLivraison = this.colisList.filter((item) => item.etat === "enCoursDeLivraison");
        this.enAttenteDEnlevementTotal = this.colisList.filter((item) => item.etat === "enAttenteDEnlevement").length;
        this.enAttenteDEnlevement = this.colisList.filter((item) => item.etat === "enAttenteDEnlevement");
        this.enAttenteDEnlevementPrixTotal = this.enAttenteDEnlevement.reduce((acc, cur) => acc + cur["cod"], 0);
        this.planificationRetourEchangeTotal = this.colisList.filter((item) => item.etat !== "planificationRetour" && item.etat !== "enAttenteDEnlevement" && item.etat !== "enCoursDeLivraison").length;
        this.planificationRetourEchange = this.colisList.filter((item) => item.etat !== "planificationRetour" && item.etat !== "enAttenteDEnlevement" && item.etat !== "enCoursDeLivraison");
        this.planificationRetourEchangePrixTotal = this.planificationRetourEchange.reduce((acc, cur) => acc + cur["cod"], 0);

        this.enCoursDeLivraisonPrixTotal = this.enCoursDeLivraison.reduce((acc, cur) => acc + cur["cod"], 0);

        this.planificationRetour = this.colisList.filter((item) => item.etat === "planificationRetour" || item.etat === "retourEchange");
        this.planificationRetourTotal = this.planificationRetour.length;
        this.planificationRetourPrixTotal = this.planificationRetour.reduce((acc, cur) => acc + cur["cod"], 0);
      })
    }

    this.hubService.getHubBySocieteLiv().subscribe((data) => {
      this.hubList = data
    })
    this.debriefService.getAllAnomalies().subscribe((data) => {
      this.anomalies = data;
    })
    this.contentHeader = {
      headerTitle: 'Gestion Debrief',
      actionButton: true,
      breadcrumb: {
        type: '',
        links: [
          {
            name: 'Home',
            isLink: true,
            link: '/'
          },
          {
            name: 'Gestion Debrief',
            isLink: false
          }
        ]
      }
    };
  }
  param;
  onChangeHub() {
    this.hubService.getLivreurListByHub(this.selectedHub.id_hub).subscribe(data => {
      this.selectLivreur = data;
    })

  }
  onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
    this.selectedenCoursDeLivraison = this.selected
    console.log(this.selectedenCoursDeLivraison)

  }
  onSelectPickup({ selected }) {
    // console.log('Select Event', selected, this.selectedPickup);

    // this.selectedPickup.splice(0, this.selectedPickup.length);
    // this.selectedPickup.push(...selected);
    // this.selectedPickupList = this.selectedPickup
    console.log(this.selectedPickupList)

  }
  onSelectPR({ selected }) {
    console.log('Select Event', selected, this.selectedPR);

    this.selectedPR.splice(0, this.selectedPR.length);
    this.selectedPR.push(...selected);
    this.selectedPlanificationRetour = this.selectedPR
    console.log(this.selectedPlanificationRetour)

  }

  onActivate(event) {
    // console.log('Activate Event', event);
  }
  getRunsheet() {
    this.debriefService.getRunsheetList(this.selectedLivreur.iduser).subscribe((data) => {
      this.selectRunsheet = data;
    })
  }
  filterByLivreur() {
    this.debriefService.getListColisByLivreur(this.selectedLivreur.iduser, this.selectedRunsheet.id).subscribe((data) => {
      this.colisList = data;
      this.enCoursDeLivraisonTotal = this.colisList.filter((item) => item.etat === "enCoursDeLivraison").length;
      this.enCoursDeLivraison = this.colisList.filter((item) => item.etat === "enCoursDeLivraison");
      this.enAttenteDEnlevement = this.colisList.filter((item) => item.etat === "enAttenteDEnlevement");
      this.enAttenteDEnlevementTotal = this.enAttenteDEnlevement.length;

      console.log(this.enAttenteDEnlevement)
      this.enAttenteDEnlevementPrixTotal = this.enAttenteDEnlevement.reduce((acc, cur) => acc + cur["cod"], 0);
      this.planificationRetourEchangeTotal = this.colisList.filter((item) => item.etat !== "planificationRetour" && item.etat !== "enAttenteDEnlevement" && item.etat !== "enCoursDeLivraison").length;
      this.planificationRetourEchange = this.colisList.filter((item) => item.etat !== "planificationRetour" && item.etat !== "enAttenteDEnlevement" && item.etat !== "enCoursDeLivraison");
      this.planificationRetourEchangePrixTotal = this.planificationRetourEchange.reduce((acc, cur) => acc + cur["cod"], 0);

      this.enCoursDeLivraisonPrixTotal = this.enCoursDeLivraison.reduce((acc, cur) => acc + cur["cod"], 0);

      this.planificationRetour = this.colisList.filter((item) => item.etat === "planificationRetour");
      this.planificationRetourTotal = this.colisList.filter((item) => item.etat === "planificationRetour").length;
      this.planificationRetourPrixTotal = this.planificationRetour.reduce((acc, cur) => acc + cur["cod"], 0);

    })

  }
  colisLivre() {
    this.totalCodColisLivre = this.totalCodColisLivre + this.selectedenCoursDeLivraison.reduce((acc, cur) => acc + cur["cod"], 0);
    const barcodes = this.selectedenCoursDeLivraison.map((item) => item.bar_code)
    const body = {
      barcodes: barcodes,
      nextStatus: "livre"

    }
    this.debriefService.treatColisDebriefBSM(body).subscribe((data => {
      this._toastrService.success('les colis ' + barcodes.join(',') + ' ont été livré  !',

        ' !', { toastClass: 'toast ngx-toastr', closeButton: true, timeOut: 2000 });
      // let i = 0;
      // let bb = this.enCoursDeLivraison;
      // while (i < bb.length) {
      //   if (barcodes.includes(bb[i].bar_code)) {
      //     this.enCoursDeLivraison.splice(i, 1);
      //   }
      //   else {
      //     i++;

      //   }
      // }
      this.enCoursDeLivraison = this.enCoursDeLivraison.filter((item) => !barcodes.includes(item.bar_code));
      this.selected = []
      this.enCoursDeLivraisonTotal = this.enCoursDeLivraison.length;
      this.enCoursDeLivraisonPrixTotal = this.enCoursDeLivraison.reduce((acc, cur) => acc + cur["cod"], 0);
      this.selectedenCoursDeLivraison = []
    }))
  }
  openCreateModal(createModel) {
    this.modalService.open(createModel, {
      centered: true,
      size: 'lg'
    });
  }
  btnDisplayForm() {

    this.displayForm = true;
  };
  btnAnnulerForm() {

    this.displayForm = false;
  };

  openUpdateModal(hub: Hub, modalUpdate) {
    this.modalService.open(modalUpdate, {
      centered: true,
      size: 'lg'
    });
    this.editHub = hub;

  }
  validerColis() {
    const found = this.enCoursDeLivraison.some(el => el.bar_code == this.barCodeColis);
    if (found) {

      const el = this.enCoursDeLivraison.find(item => item.bar_code == this.barCodeColis)
    }
  }

  closeModel() {
    this.modalService.dismissAll();

  }



  openViewModal() {
    const found = this.enCoursDeLivraison.some(el => el.bar_code == this.barCodeColis);
    const notfound = this.colisList.some(el => el.bar_code == this.barCodeColis);
    const found1 = this.enAttenteDEnlevement.some(el => el.bar_code == this.barCodeColis);
    const found2 = this.planificationRetour.some(el => el.bar_code == this.barCodeColis);
    const found3 = this.planificationRetourEchange.some(el => el.bar_code == this.barCodeColis);
    if (found) {
      const el = this.enCoursDeLivraison.find(item => item.bar_code == this.barCodeColis);
      let zz = [];
      zz.push(el);
      this._toastrService.success('un colis  ' + el.etat + ' est scanné ',
        '', { toastClass: 'toast ngx-toastr', closeButton: true });
      this.barCodeColis = null;
      this.encours.selected = this.encours.selected.concat(zz)
      this.selected = this.encours.selected
      // this.encours.selectCheck()
      this.selectedenCoursDeLivraison = this.selected;
      console.log(this.selectedenCoursDeLivraison)

    }
    if (found1) {
      const el = this.enAttenteDEnlevement.find(item => item.bar_code == this.barCodeColis);
      let zz = [];
      zz.push(el);
      this._toastrService.success('un colis  ' + el.etat + ' est scanné ',
        '', { toastClass: 'toast ngx-toastr', closeButton: true });
      this.barCodeColis = null;
      this.enAttenteDEnlevementdt.selected = this.enAttenteDEnlevementdt.selected.concat(zz)
      this.selectedPickup = this.enAttenteDEnlevementdt.selected
      // this.encours.selected = this.encours.selected.concat(zz)
      this.selectedPickupList = this.selectedPickup;

    }
    if (found2) {
      const el = this.planificationRetour.find(item => item.bar_code == this.barCodeColis);
      let zz = [];
      zz.push(el);
      this._toastrService.success('un colis  ' + el.etat + ' est scanné ',
        '', { toastClass: 'toast ngx-toastr', closeButton: true });
      this.barCodeColis = null;
      this.planification.selected = this.planification.selected.concat(zz)

      // this.encours.selected = this.encours.selected.concat(zz)
      this.selectedPR = this.selectedPR.concat(zz);
    }
    // if (found1 || found2) {
    //   this.debriefService.treatColisDebriefBS(this.barCodeColis).subscribe(data => {
    //     this.filterByLivreur();
    //     if (data.startingStatus !== data.arrivalStatus) {
    //       this._toastrService.success('L etat du colis ' + this.barCodeColis + ' est changé de ' + data.startingStatus + ' à ' + data.arrivalStatus + ' ! ',
    //         '', { toastClass: 'toast ngx-toastr', closeButton: true });

    //     }
    //     else if (data.arrivalStatus === 'planificationRetour') {
    //       this._toastrService.success('L etat du colis ' + this.barCodeColis + ' est ' + data.arrivalStatus + ' avec un anomalie de retour ! ',
    //         '', { toastClass: 'toast ngx-toastr', closeButton: true });

    //     }
    //     else {
    //       this._toastrService.success('L etat du colis ' + this.barCodeColis + ' est ' + data.arrivalStatus + '! ',
    //         '', { toastClass: 'toast ngx-toastr', closeButton: true });

    //     }
    //   })
    // }

    if (found3) {
      this._toastrService.success('Le colis ' + this.barCodeColis + ' est en retour ! ',
        'Ajout avec succès !', { toastClass: 'toast ngx-toastr', closeButton: true });
    }
    if (!notfound) {
      this._toastrService.error("Colis invalide",
        "Échec !", { toastClass: 'toast ngx-toastr', closeButton: true, timeOut: 2000 });

    }



  }

  onSelectAnomalie() {
    const barcodes = this.selectedenCoursDeLivraison.map((item) => item.bar_code)

    this.debriefService.assignAnomalieToColisList(barcodes, this.anomaly.id).subscribe((data => {
      this._toastrService.success('un anomaly de ' + this.anomaly.acronyme + ' est assigné pour les colis ' + barcodes.join(','),
        ' !', { toastClass: 'toast ngx-toastr', closeButton: true, timeOut: 2000 });
      let i = 0;
      this.enCoursDeLivraison = this.enCoursDeLivraison.filter((item) => !barcodes.includes(item.bar_code));

      this.selected = []
      this.enCoursDeLivraisonTotal = this.enCoursDeLivraison.length;
      this.enCoursDeLivraisonPrixTotal = this.enCoursDeLivraison.reduce((acc, cur) => acc + cur["cod"], 0);
      this.selectedenCoursDeLivraison = []
      this.anomaly = null
      this.encours.selected = []
    }))
  }
  retourStock() {
    const barcodes = this.selectedPR.map((item) => item.bar_code)
    const body = {
      barcodes: barcodes,
      nextStatus: "planificationRetour"
    }
    this.debriefService.treatColisDebriefBSM(body).subscribe((data => {
      this._toastrService.success('les colis ' + barcodes.join(',') + ' ont été traité  ! ',
        ' !', { toastClass: 'toast ngx-toastr', closeButton: true });
      let i = 0;
      this.planificationRetour = this.planificationRetour.filter((item) => !barcodes.includes(item.bar_code));

      this.planificationRetourTotal = this.planificationRetour.length;
      this.planificationRetourPrixTotal = this.planificationRetour.reduce((acc, cur) => acc + cur["cod"], 0);
      this.selectedPR = []
      this.planification.selected = []
    }))
  }
  retourne() {
    const barcodes = this.selectedPR.map((item) => item.bar_code)
    const body = {
      barcodes: barcodes,
      nextStatus: "retourne"
    }
    this.debriefService.treatColisDebriefBSM(body).subscribe((data => {
      this._toastrService.success('les colis ' + barcodes.join(',') + ' ont été traité  ! ',
        ' !', { toastClass: 'toast ngx-toastr', closeButton: true });
      this.planificationRetour = this.planificationRetour.filter((item) => !barcodes.includes(item.bar_code));


      this.planificationRetourTotal = this.planificationRetour.length;
      this.planificationRetourPrixTotal = this.planificationRetour.reduce((acc, cur) => acc + cur["cod"], 0);
      this.selectedPR = []
      this.planification.selected = []
    }))
  }
  showAnomalieForm() {
    this.displayAnomalie = true;
  }
  ajouterAnomalie() {
    console.log("z")
  }
  cloturer() {

  }
  assignerEnlevement() {

    const barcodes = this.selectedPickupList.map((item) => item.bar_code)

    this.debriefService.assignAnomalieToColisList(barcodes, 3).subscribe((data => {
      this._toastrService.success('un anomaly d enlevement ' + ' est assigné pour les colis ' + barcodes.join(','),
        ' !', { toastClass: 'toast ngx-toastr', closeButton: true, timeOut: 2000 });
      let i = 0;

      this.enAttenteDEnlevement = this.enAttenteDEnlevement.filter((item) => !barcodes.includes(item.bar_code));

      this.selectedPickup = []
      this.enAttenteDEnlevementTotal = this.enAttenteDEnlevement.length;
      this.enAttenteDEnlevement = this.enAttenteDEnlevement.reduce((acc, cur) => acc + cur["cod"], 0);
      this.selectedPickupList = []
      this.enAttenteDEnlevementdt.selected = []
    }))
  }

  entrerStock() {
    const barcodes = this.selectedPickupList.map((item) => item.bar_code)
    const body = {
      barcodes: barcodes,
      nextStatus: "enStock"
    }
    this.debriefService.treatColisDebriefBSM(body).subscribe((data => {
      this._toastrService.success('les colis ' + barcodes.join(',') + ' sont en stock  ! ',
        ' !', { toastClass: 'toast ngx-toastr', closeButton: true });

      this.enAttenteDEnlevement = this.enAttenteDEnlevement.filter((item) => !barcodes.includes(item.bar_code));

      this.enAttenteDEnlevementTotal = this.enAttenteDEnlevement.length;
      this.enAttenteDEnlevementPrixTotal = this.enAttenteDEnlevement.reduce((acc, cur) => acc + cur["cod"], 0);
      this.selectedPickupList = []
      this.enAttenteDEnlevementdt.selected = []

    }))
  }
  createDebrief() {
    const listOfColis = this.enAttenteDEnlevement.concat(this.enCoursDeLivraison, this.planificationRetour, this.planificationRetourEchange);
    const barcodes = listOfColis.map((item) => item.bar_code);
    const body = {
      colisBarCodes: barcodes,
      idLivreur: this.selectedLivreur.iduser,
      idRunsheet: this.selectedRunsheet.id,
      idValidator: this.validator,
      toBeEnclosed: true

    }
    if (!this.isUpdate) {
      this.debriefService.createDebrief(body).subscribe((data) => {
        this.totalCODColisLivreTotal = data.totalCODColisLivre;
        this._toastrService.success('Debrief cloturé avec succée , Total COD est ' + this.totalCODColisLivreTotal,

          ' Succée !', { toastClass: 'toast ngx-toastr', closeButton: true, timeOut: 5000 });
        setTimeout(() => {
          this.openDebriefModal()

        })
      })
    }
    else {
      body["id"] = this.param;
      body.toBeEnclosed = true;
        this.debriefService.updateDebrief(body).subscribe((data) => {
          this.totalCODColisLivreTotal = data.totalCODColisLivre;
          this._toastrService.success('Debrief cloturé avec succée , Total COD est ' + this.totalCODColisLivreTotal,
  
            ' Succée !', { toastClass: 'toast ngx-toastr', closeButton: true, timeOut: 5000 });
          setTimeout(() => {
            this.openDebriefModal()
  
          })
        })
      }
  }
  saveDraftDebrief() {
    const listOfColis = this.enAttenteDEnlevement.concat(this.enCoursDeLivraison, this.planificationRetour, this.planificationRetourEchange);
    const barcodes = listOfColis.map((item) => item.bar_code);
    const body = {
      colisBarCodes: barcodes,
      idLivreur: this.selectedLivreur.iduser,
      idRunsheet: this.selectedRunsheet.id,
      idValidator: this.validator,
      toBeEnclosed: false

    }
    if (!this.isUpdate) {
      this.debriefService.createDebrief(body).subscribe((data) => {
        this.totalCODColisLivreTotal = data.totalCODColisLivre;
        this._toastrService.success('Debrief cloturé avec succée , Total COD est ' + this.totalCODColisLivreTotal,

          ' Succée !', { toastClass: 'toast ngx-toastr', closeButton: true, timeOut: 5000 });
        setTimeout(() => {
          this.openDebriefModal()

        })
      })
    }
    else {
      body["id"] = this.param;
      this.debriefService.updateDebrief(body).subscribe((data) => {
        this._toastrService.success('Debrief Draft sauvegardé avec succée TOTAL COD des colis livré est ',
          ' Succée !', { toastClass: 'toast ngx-toastr', closeButton: true, timeOut: 5000 });
        setTimeout(() => {
          this.openDrafModal()

        })
      })
    }


  }
  isCloturerDisabled() {

    return this.enAttenteDEnlevement.length + this.enCoursDeLivraison.length + this.planificationRetour.length !== 0;
  }
  openDrafModal() {
    this.modalService.open(this.modalDraft, {
      centered: true,
      size: 'lg'
    });
  }
  openDebriefModal() {
    this.modalService.open(this.modalDebrief, {
      centered: true,
      size: 'lg'
    });
  }
  navigate() {
    this.router.navigate(['/list-debrief/list-debrief']);
  }
}
