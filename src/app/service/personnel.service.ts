
import { environment } from 'environments/environment';
import { LivreurList, Personnel } from '../Model/personnel';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { SocieteLiv } from 'app/Model/societeLiv';

@Injectable({
  providedIn: 'root'
})
export class PersonnelService {
 
  private apiServerUrl =  environment.apiBaseUrl;
  private societeLivraisonID = environment.societeLivraisonID;

  constructor(private http: HttpClient) {}
  
  public addPersonnel(personnel : Personnel): Observable<Personnel> {
    return this.http.post<Personnel>(`${this.apiServerUrl}/addPersonnel`, personnel);
  }
  public getPersonnelBySocieteLiv(): Observable<Personnel[]> {
    return this.http.get<Personnel[]>(`${this.apiServerUrl}/getPersonnelBySocieteLiv/${this.societeLivraisonID}`);
  }
  public getAllPersonnel(): Observable<Personnel[]> {
    return this.http.get<Personnel[]>(`${this.apiServerUrl}/retrieveAllPersonnels`);
  }
  public getSocieteLivByIdpersonnel(id: number): Observable<SocieteLiv> {
    return this.http.get<SocieteLiv>(`${this.apiServerUrl}/getSocieteLivByIDPersonnel/${id}`);
  }
  public updatePersonnel(personnel : Personnel): Observable<Personnel> {
    return this.http.put<Personnel>(`${this.apiServerUrl}/modify-Personnel`,personnel);    
  }
  public deletePersonnel(ref : number): Observable<void> {
    return this.http.delete<void>(`${this.apiServerUrl}/removePersonnel/${ref}`);
  }
  public getPersonnelById(id : number): Observable<Personnel> {
    return this.http.get<Personnel>(`${this.apiServerUrl}/retrieve-Personnel/${id}`);
  } 
  public createData(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiServerUrl}/addPersonnelWithImageAndPermisAndCarteG`, formData);
  }  
  public getLivreurList(): Observable<LivreurList[]> {
    return this.http.get<LivreurList[]>(`${this.apiServerUrl}/getLivreurList`);
  }
  public updatePersonnelPhoto(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiServerUrl}/updatePersonnelImage`, formData);
  }
}
