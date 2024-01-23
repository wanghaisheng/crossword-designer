import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ToolbarComponent } from "./toolbar.component";

describe("ToolbarComponent", () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolbarComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {});

  describe("onEditModeChange", () => {
    it("should set edit mode and emit edit mode change", () => {
      const mode = 1;
      spyOn(component.editModeChange$, "emit");

      component.onEditModeChange(mode);

      expect(component.editMode).toEqual(mode);
      expect(component.editModeChange$.emit).toHaveBeenCalledWith(mode);
    });
  });

  describe("onViewModeChange", () => {
    it("should set view mode and emit view mode change", () => {
      const mode = 2;
      spyOn(component.viewModeChange$, "emit");

      component.onViewModeChange(mode);

      expect(component.viewMode).toEqual(mode);
      expect(component.viewModeChange$.emit).toHaveBeenCalledWith(mode);
    });
  });

  describe("onLock", () => {
    it("should toggle lock and emit lock event", () => {
      spyOn(component.lockEvent$, "emit");

      component.onLock();

      expect(component.locked).toEqual(true);
      expect(component.lockEvent$.emit).toHaveBeenCalledWith();
    });
  });

  describe("onSave", () => {
    it("should emit save event", () => {
      spyOn(component.saveEvent$, "emit");

      component.onSave();

      expect(component.saveEvent$.emit).toHaveBeenCalledWith();
    });
  });

  describe("onClear", () => {
    it("should emit save event", () => {
      spyOn(component.clearEvent$, "emit");

      component.onClear();

      expect(component.clearEvent$.emit).toHaveBeenCalledWith();
    });
  });

  describe("onShowHide", () => {
    it("should toggle hidden and emit show hide event", () => {
      spyOn(component.showHideEvent$, "emit");

      component.onShowHide();

      expect(component.answersHidden).toEqual(true);
      expect(component.showHideEvent$.emit).toHaveBeenCalledWith();
    });
  });

  describe("onSort", () => {
    it("should toggle sort reverse and emit sort event", () => {
      spyOn(component.sortEvent$, "emit");

      component.onSort();

      expect(component.sortReverse).toEqual(true);
      expect(component.sortEvent$.emit).toHaveBeenCalledWith();
    });
  });

  describe("onFilter", () => {
    it("should do nothing when inputs pristine", () => {
      spyOn(component.filterEvent$, "emit");
      component.lengthInput.markAsPristine();
      component.containsInput.markAsPristine();

      component.onFilter();

      expect(component.filterEvent$.emit).not.toHaveBeenCalled();
    });

    it("should set filters on and emit filter event when length dirty", () => {
      spyOn(component.filterEvent$, "emit");
      component.lengthInput.setValue(3);
      component.lengthInput.markAsDirty();
      component.containsInput.markAsPristine();

      component.onFilter();

      expect(component.filterEvent$.emit).toHaveBeenCalledWith({ length: 3, contains: null });
    });

    it("should set filters on and emit filter event when contains dirty", () => {
      spyOn(component.filterEvent$, "emit");
      component.containsInput.setValue("A");
      component.containsInput.markAsDirty();
      component.lengthInput.markAsPristine();

      component.onFilter();

      expect(component.filterEvent$.emit).toHaveBeenCalledWith({ length: null, contains: "A" });
    });
  });

  describe("onFilterClear", () => {
    it("should set filters off, reset inputs, and emit filter event", () => {
      spyOn(component.filterEvent$, "emit");
      spyOn(component.lengthInput, "reset");
      spyOn(component.containsInput, "reset");
      component.lengthInput.setValue(3);
      component.containsInput.setValue("A");

      component.onFilterClear();

      expect(component.filtersOn).toEqual(false);
      expect(component.lengthInput.reset).toHaveBeenCalled();
      expect(component.containsInput.reset).toHaveBeenCalled();
      expect(component.filterEvent$.emit).toHaveBeenCalledWith({ length: null, contains: null });
    });
  });
});
