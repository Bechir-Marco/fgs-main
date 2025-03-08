import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Colis } from 'app/Model/colis';
import { ColisService } from 'app/service/colis.service';
import Stepper from 'bs-stepper';
import { ToastrService, GlobalConfig } from 'ngx-toastr';

import { FournisseurService } from 'app/service/fournisseur.service';
import { Fournisseur } from 'app/Model/fournisseur';
import { environment } from 'environments/environment';
import { User } from 'app/auth/models';
import { AuthenticationService } from 'app/auth/service';
import { Router } from '@angular/router';
import { SocieteLivService } from 'app/service/societeLiv.service';

@Component({
  selector: 'app-societe',
  templateUrl: './societe.component.html',
  styleUrls: ['./societe.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SocieteComponent implements OnInit { 
  @ViewChild('addSocieteForm') public societeForm: NgForm;
  contentHeader : any;
  adresseVar;
  matriculeFiscaleVar;
  nomCompletVar;
  sigleVar;
  telephoneVar;
  idVar;

  constructor(private _toastrService: ToastrService, private societeLivService : SocieteLivService,
    private _authenticationService: AuthenticationService,private _router : Router) {
  }

  ngOnInit()  {
    this.contentHeader = {
      headerTitle: 'Sociéte Principale',
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
            name: 'Sociéte Principale',
            isLink: false
          }
        ]
      }
    };
    this.societeLivService.getSocieteLivById().subscribe(data=>{
    this.societeForm.controls['adresse'].setValue(data.adresse)
    this.societeForm.controls['matriculeFiscale'].setValue(data.matriculeFiscale)
    this.societeForm.controls['nomComplet'].setValue(data.nomComplet)
    this.societeForm.controls['sigle'].setValue(data.sigle)
    this.societeForm.controls['telephone'].setValue(data.telephone)

     })

  }
  onAddSociete(form : NgForm) {
    console.log(form.value)
    this.societeLivService.addSociete(form.value).subscribe(data=>{
      this._toastrService.success('Société principale est mis à jour avec succès ! ',
      'Mis à jour avec succès !', { toastClass: 'toast ngx-toastr', closeButton: true, timeOut: 1000 });
    })
  }

 
}
