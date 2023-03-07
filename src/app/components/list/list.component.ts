import { tableColumns } from './../../utils/column-template';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { switchMap, filter, Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { NetworkService } from 'src/app/services/network.service';
import { Item } from 'src/app/models/Item';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, OnDestroy {
  public isOnline: Boolean;
  public items: Item[];
  private delayedHttpRequests: Item[];
  public columns = tableColumns;
  public displayedColumns: string[];
  private onDestroy$: Subject<void>;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public dialog: MatDialog,
    private networkService: NetworkService
  ) {
    this.isOnline = true;
    this.items = [];
    this.delayedHttpRequests = [];
    this.displayedColumns = this.columns.map((c) => c.columnDef);
    this.onDestroy$ = new Subject<void>();
  }

  ngOnInit(): void {
    this.onInitItemsSubscription();
    this.onInitNetworkStatusSubscription();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public itemForm = this.fb.group({
    name: new FormControl('', [
      Validators.minLength(2),
      Validators.maxLength(50),
      Validators.required,
    ]),
    quantity: new FormControl(1, [
      Validators.pattern(/[0-9]/),
      Validators.min(1),
    ]),
  });

  public clearInput = (): void => this.itemForm.patchValue({ name: '' });

  private onInitNetworkStatusSubscription(): void {
    this.networkService.createOnline$().pipe(
      takeUntil(this.onDestroy$)
      ).subscribe((status: Boolean) => this.isOnline = status);
  }

  private onInitItemsSubscription(): void {
    this.apiService.getItems$().pipe(takeUntil(this.onDestroy$))
      .subscribe((res: Item[]) => (this.items = res));
  }

  public openDialog(index: number): void {
    const data: Item = this.items[index];
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '280px',
      data: data,
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(this.apiService.editItem$),
        switchMap(this.apiService.getItems$),
        takeUntil(this.onDestroy$)
      )
      .subscribe((res) => (this.items = res));
  }

  // private handleOfflineHttpRequests(item: Item): void {
  //   if (!this.isOnline) {
  //     this.items.push(item);
  //     this.delayedHttpRequests.push(item);
  //   } 
  // }

  public onRemove(index: number): void {
    const itemId = this.items[index]._id ?? '';
    this.apiService
      .deleteItem$(itemId)
      .pipe(switchMap(this.apiService.getItems$), takeUntil(this.onDestroy$))
      .subscribe((res) => (this.items = res));
  }

  onSubmit() {
    const item = {
      name: this.itemForm.controls.name.value,
      quantity: this.itemForm.controls.quantity.value,
    } as Item;
    if (!this.isOnline) {
      this.items.push(item);
    } 
    this.apiService
      .addItem$(item)
      .pipe(
        switchMap(this.apiService.getItems$), 
        takeUntil(this.onDestroy$))
      .subscribe((res) => (this.items = res));
    this.itemForm.controls.name.reset();
  }
}
