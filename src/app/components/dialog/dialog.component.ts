import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Item } from 'src/app/models/Item';
import { FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: Item
  ) {}

  ngOnInit(): void {
    this.onInitDataSet();
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
      Validators.max(100),
    ]),
  });

  private onInitDataSet(): void {
    if (this.data) {
      this.itemForm.setValue({
        name: this.data.name,
        quantity: this.data.quantity ?? 1,
      });
    }
  }

  public onSubmit(): void {
    const compareData = (obj1: Item, obj2: Item): Boolean => {
      return obj1.name === obj2.name && obj1.quantity === obj2.quantity;
    };
    const formValue = {
      name: this.itemForm.controls.name.value,
      quantity: this.itemForm.controls.quantity.value,
    } as Item;

    if (compareData(this.data, formValue)) {
      this.dialogRef.close();
    } else {
      this.dialogRef.close({
        _id: this.data._id,
        name: formValue.name,
        quantity: formValue.quantity,
      });
    }
  }
}
