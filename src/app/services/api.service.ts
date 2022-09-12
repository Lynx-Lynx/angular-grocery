import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from '../models/Item';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private url = environment.API_ENDPOINT;

  constructor(private http: HttpClient) {}

  public getItems = (): Observable<Item[]> => {
    return this.http.get<Item[]>(this.url);
  };

  public addItem(item: Item): Observable<Item> {
    return this.http.post<Item>(this.url, item);
  }

  public editItem = (item: Item): Observable<Item> => {
    return this.http.patch<Item>(`${this.url}/${item._id}`, item);
  };

  public deleteItem = (id: string): Observable<Item> => {
    return this.http.delete<Item>(`${this.url}/${id}`);
  };
}
