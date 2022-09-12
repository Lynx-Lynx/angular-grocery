import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { Subscription, switchMap, filter } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { Item } from 'src/app/models/Item';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, OnDestroy {
  public items: Item[] = [];
  private subscriptions: Subscription[] = [];

  public columns = [
    {
      columnDef: 'name',
      header: 'Name',
      cell: (element: Item) => `${element.name}`,
    },
    {
      columnDef: 'quantity',
      header: 'Quantity',
      cell: (element: Item) => `${element.quantity}`,
    },
    {
      columnDef: 'edit',
      header: '',
      cell: '',
    },
    {
      columnDef: 'delete',
      header: '',
      cell: '',
    },
  ];
  public displayedColumns = this.columns.map((c) => c.columnDef);

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.onInitItemsSubscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
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

  private onInitItemsSubscription() {
    const itemsOnInitSub = this.apiService
      .getItems()
      .subscribe((res) => (this.items = res));
    this.subscriptions.push(itemsOnInitSub);
  }

  public openDialog(index: number): void {
    const data: Item = this.items[index];
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '280px',
      data: data,
    });

    const dialogSub = dialogRef
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(this.apiService.editItem),
        switchMap(this.apiService.getItems)
      )
      .subscribe((res) => (this.items = res));

    this.subscriptions.push(dialogSub);
  }

  public onRemove(index: number): void {
    const itemId = this.items[index]._id ?? '';
    const removeSub = this.apiService
      .deleteItem(itemId)
      .pipe(switchMap(this.apiService.getItems))
      .subscribe((res) => (this.items = res));
    this.subscriptions.push(removeSub);
  }

  onSubmit() {
    const item = {
      name: this.itemForm.controls.name.value,
      quantity: this.itemForm.controls.quantity.value,
    } as Item;
    const itemSub = this.apiService
      .addItem(item)
      .pipe(switchMap(this.apiService.getItems))
      .subscribe((res) => (this.items = res));
    this.subscriptions.push(itemSub);
    this.itemForm.controls.name.reset();
  }
}
