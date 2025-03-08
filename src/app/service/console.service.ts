import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Console } from 'app/Model/console';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Hub } from '../Model/hub';

@Injectable({
  providedIn: 'root'
})
export class ConsoleService implements Resolve<any> {

  rows: any;
  
  onDatatablessChanged: BehaviorSubject<any>;
  private apiServerUrl =  environment.apiBaseUrl;
  private societeLivraisonID = environment.societeLivraisonID;
  constructor(private http: HttpClient) { this.onDatatablessChanged = new BehaviorSubject({});}

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return new Promise<void>((resolve, reject) => {
      Promise.all([this.getDataTableRows()]).then(() => {
        resolve();
      }, reject);
    });
  }
  getDataTableRows(): Promise<any[]> {
    return new Promise((resolve, reject) => {
     // this.http.get(`${this.apiServerUrl}/getHubBySocieteLiv/${this.societeLivraisonID}`).subscribe((response: any) => {
      this.http.get(`${this.apiServerUrl}/retrieve-all-consoles`).subscribe((response: any) => {
       
     this.rows = response;
        this.onDatatablessChanged.next(this.rows);
        resolve(this.rows);
      }, reject);
    });
  }

  public addHub(hub : Console): Observable<Console> {
    return this.http.post<Console>(`${this.apiServerUrl}/addConsole`, hub);
  }
  public getConsoleBySocieteLiv(): Observable<Console[]> {
    return this.http.get<Console[]>(`${this.apiServerUrl}/retrieve-all-consoles`);
  }
  public getConsolesSortant(id): Observable<Console[]> {
    return this.http.get<Console[]>(`${this.apiServerUrl}/findConsolesSortant/${id}`);
  }
  public getConsolesEntrant(id): Observable<Console[]> {
    return this.http.get<Console[]>(`${this.apiServerUrl}/findConsolesEntrant/${id}`);
  }
  public updateConsole(console : Console): Observable<Console> {
    return this.http.put<Console>(`${this.apiServerUrl}/modify-Console`,console);
  }
  public deleteHub(ref : number): Observable<void> {
    return this.http.delete<void>(`${this.apiServerUrl}/remove-console/${ref}`);
  }
  public getHubById(id : number): Observable<Hub> {
    return this.http.get<Hub>(`${this.apiServerUrl}/retrieve-Hub/${id}`);
  }
  public findColisHubDepartHubArrivee(barcode): Observable<Hub> {
    return this.http.get<Hub>(`${this.apiServerUrl}/findColisHubDepartHubArrivee/${barcode}`);
  }
  
  
  public getConsoleByBarCode(barcode): Observable<any> {
    return this.http.get<any>(`${this.apiServerUrl}/findConsoleByBarCode/${barcode}`);
  }
  public addConsole(body): Observable<Console> {
    return this.http.post<Console>(`${this.apiServerUrl}/addConsole`, body);
  }
  public approveConsole(barcode,userId): Observable<any> {
    return this.http.put<any>(`${this.apiServerUrl}/approveConsole/${barcode}/${userId}`,{});
  }

}