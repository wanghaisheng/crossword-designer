import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { EditMode, ViewMode } from "../grid/grid.component";
import { FormControl } from "@angular/forms";

enum ToolbarType {
  Default,
  AnswerDrafting,
  PuzzleEditing,
  ClueEditing,
}

export interface ToolbarConfig {
  type: ToolbarType;
}

export interface Filter {
  length: number | null;
  contains: string | null;
}

@Component({
  selector: "app-toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"],
})
export class ToolbarComponent implements OnInit {
  @Input() name: string = "Untitled";
  @Input() locked: boolean = false;
  @Input() config: ToolbarConfig = { type: ToolbarType.Default };

  @Output() editModeChange$: EventEmitter<EditMode> = new EventEmitter();
  @Output() viewModeChange$: EventEmitter<ViewMode> = new EventEmitter();
  @Output() lockEvent$: EventEmitter<undefined> = new EventEmitter();
  @Output() saveEvent$: EventEmitter<undefined> = new EventEmitter();
  @Output() clearEvent$: EventEmitter<undefined> = new EventEmitter();
  @Output() showHideEvent$: EventEmitter<undefined> = new EventEmitter();
  @Output() sortEvent$: EventEmitter<undefined> = new EventEmitter();
  @Output() filterEvent$: EventEmitter<Filter> = new EventEmitter();

  public nameInput: FormControl = new FormControl("");
  public editMode: number = 0;
  public viewMode: number = 0;
  public answersHidden: boolean = false;
  public sortReverse: boolean = false;
  public filtersOn: boolean = false;
  public lengthInput: FormControl = new FormControl();
  public containsInput: FormControl = new FormControl();

  constructor() {}

  ngOnInit(): void {
    this.editMode = this.config.type == ToolbarType.AnswerDrafting ? 2 : 0;
    this.nameInput.setValue(this.name);
  }

  public onEditModeChange(mode: number): void {
    this.editMode = mode;
    this.editModeChange$.emit(mode);
  }

  public onViewModeChange(mode: number): void {
    this.viewMode = mode;
    this.viewModeChange$.emit(mode);
  }

  public onLock(): void {
    this.locked = !this.locked;
    this.lockEvent$.emit();
  }

  public onSave(): void {
    this.saveEvent$.emit();
  }

  public onClear(): void {
    this.clearEvent$.emit();
  }

  public onShowHide(): void {
    this.answersHidden = !this.answersHidden;
    this.showHideEvent$.emit();
  }

  public onSort(): void {
    this.sortReverse = !this.sortReverse;
    this.sortEvent$.emit();
  }

  public onFilter(): void {
    if (this.lengthInput.dirty || this.containsInput.dirty) {
      this.filtersOn = true;
      this.filterEvent$.emit({ length: this.lengthInput.value, contains: this.containsInput.value });
    }
  }

  public onFilterClear(): void {
    this.filtersOn = false;

    this.lengthInput.reset();
    this.containsInput.reset();
    this.filterEvent$.emit({ length: null, contains: null });
  }
}
