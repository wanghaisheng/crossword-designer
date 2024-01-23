import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";

import { of, throwError } from "rxjs";

import { AnswerDraftingComponent } from "./answer-drafting.component";
import { AnswerService } from "src/app/services/answer.service";
import { AnswerBank } from "src/app/models/answer.model";
import { PuzzleService } from "src/app/services/puzzle.service";

describe("AnswerDraftingComponent", () => {
  let component: AnswerDraftingComponent;
  let fixture: ComponentFixture<AnswerDraftingComponent>;

  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["puzzle", "togglePuzzleLock"]);
  const answerServiceSpy = jasmine.createSpyObj("AnswerService", [
    "answerBank",
    "loadAnswers",
    "addAnswer",
    "removeAnswer",
    "toggleCircle",
    "saveAnswers",
    "clearAnswers",
  ]);

  const testId = "testId";

  const testAnswerBank: AnswerBank = {
    id: testId,
    answers: ["HELLO", "GOODBYE", "TEST"],
    themeAnswers: new Map<string, Array<number>>(Object.entries({ THEME: [0, 2], ANSWER: [] })),
  };

  beforeEach(async () => {
    answerServiceSpy.answerBank = testAnswerBank;
    answerServiceSpy.saveAnswers.and.returnValue(of(undefined));

    spyOn(window, "alert");
    spyOn(console, "error");

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AnswerDraftingComponent],
      providers: [
        { provide: AnswerService, useValue: answerServiceSpy },
        { provide: PuzzleService, useValue: puzzleServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnswerDraftingComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("addAnswer", () => {
    it("should call addAnswer with true and reset form", () => {
      component.newThemeAnswerForm.setValue({
        answer: "test theme answer",
      });

      fixture.detectChanges();
      component.addAnswer(true);

      expect(answerServiceSpy.addAnswer).toHaveBeenCalledWith("TESTTHEMEANSWER", true);
      expect(component.newThemeAnswerForm.value.answer).toBeNull();
    });

    it("should call addAnswer with false and reset form", () => {
      component.newAnswerForm.setValue({
        answer: "test answer",
      });

      fixture.detectChanges();
      component.addAnswer(false);

      expect(answerServiceSpy.addAnswer).toHaveBeenCalledWith("TESTANSWER", false);
      expect(component.newAnswerForm.value.answer).toBeNull();
    });
  });

  describe("removeAnswer", () => {
    it("should call removeAnswer with true", () => {
      component.removeAnswer("TESTANSWER", true);

      expect(answerServiceSpy.removeAnswer).toHaveBeenCalledWith("TESTANSWER", true);
    });

    it("should call removeAnswer with false", () => {
      component.removeAnswer("TESTANSWER", false);

      expect(answerServiceSpy.removeAnswer).toHaveBeenCalledWith("TESTANSWER", false);
    });
  });

  describe("toggleCircle", () => {
    it("should call toggleCircle", () => {
      component.toggleCircle("testKey", 0);

      expect(answerServiceSpy.toggleCircle).toHaveBeenCalledWith("testKey", 0);
    });
  });

  describe("onLock", () => {
    it("should call togglePuzzleLock", () => {
      component.onLock();

      expect(puzzleServiceSpy.togglePuzzleLock).toHaveBeenCalled();
    });
  });

  describe("onSave", () => {
    it("should call saveAnswers and alert on success", () => {
      component.onSave();

      expect(answerServiceSpy.saveAnswers).toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });

    it("should alert failure when saveAnswers throws error", () => {
      const errorMsg = "Failed to set doc";
      answerServiceSpy.saveAnswers.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      component.onSave();

      expect(answerServiceSpy.saveAnswers).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Answers failed to save: Failed to set doc");
    });
  });

  describe("onClear", () => {
    it("should call clearAnswers", () => {
      component.onClear();

      expect(answerServiceSpy.clearAnswers).toHaveBeenCalled();
    });
  });

  describe("onSort", () => {
    it("should toggle sort reverse", () => {
      component.sortReverse = false;
      component.onSort();

      expect(component.sortReverse).toEqual(true);
    });
  });

  describe("onFilter", () => {
    it("should set filter", () => {
      const filter = { length: 3, contains: "A" };
      component.filter = { length: null, contains: null };
      component.onFilter(filter);

      expect(component.filter).toEqual(filter);
    });
  });
});
