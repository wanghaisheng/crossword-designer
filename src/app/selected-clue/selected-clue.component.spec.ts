import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { SelectedClueComponent } from "./selected-clue.component";

describe("ClueListComponent", () => {
  let component: SelectedClueComponent;
  let fixture: ComponentFixture<SelectedClueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectedClueComponent],
      imports: [FormsModule, ReactiveFormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectedClueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
