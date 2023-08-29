import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AnswerDraftingComponent } from "./answer-drafting.component";
import { AnswerBank, AnswerService } from "../services/answer.service";
import { BehaviorSubject, of, throwError } from "rxjs";
import { LoadService } from "../services/load.service";
import { ReactiveFormsModule } from "@angular/forms";

describe("AnswerDraftingComponent", () => {
  let component: AnswerDraftingComponent;
  let fixture: ComponentFixture<AnswerDraftingComponent>;

  const answerServiceSpy = jasmine.createSpyObj("AnswerService", [
    "answerBank",
    "loadAnswers",
    "addAnswer",
    "removeAnswer",
    "toggleCircle",
    "saveAnswers",
    "clearAnswers",
  ]);

  const loadServiceSpy = jasmine.createSpyObj("LoadService", ["activePuzzleId$"]);

  const testId = "testId";

  const testAnswerBank: AnswerBank = {
    id: testId,
    answers: ["HELLO", "GOODBYE", "TEST"],
    themeAnswers: new Map<string, Array<number>>(Object.entries({ THEME: [0, 2], ANSWER: [] })),
  };

  beforeEach(async () => {
    loadServiceSpy.activePuzzleId$ = new BehaviorSubject<string>(testId);

    answerServiceSpy.answerBank = testAnswerBank;
    answerServiceSpy.loadAnswers.and.returnValue(of(false));
    answerServiceSpy.saveAnswers.and.returnValue(of(undefined));

    spyOn(window, "alert");

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AnswerDraftingComponent],
      providers: [
        { provide: AnswerService, useValue: answerServiceSpy },
        { provide: LoadService, useValue: loadServiceSpy },
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

  describe("ngOnInit", () => {
    it("should alert success when loadAnswers returns true", () => {
      answerServiceSpy.loadAnswers.and.returnValue(of(true));

      fixture.detectChanges();

      expect(answerServiceSpy.loadAnswers).toHaveBeenCalledWith(testId);
      expect(window.alert).toHaveBeenCalledWith("Answers loaded successfully!");
    });

    it("should do nothing when loadAnswers returns false", () => {
      answerServiceSpy.loadAnswers.and.returnValue(of(false));

      fixture.detectChanges();

      expect(answerServiceSpy.loadAnswers).toHaveBeenCalledWith(testId);
      expect(window.alert).not.toHaveBeenCalled();
    });

    it("should alert failure when loadAnswers throws error", () => {
      const errorMsg = "Failed to get doc";
      answerServiceSpy.loadAnswers.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      fixture.detectChanges();

      expect(answerServiceSpy.loadAnswers).toHaveBeenCalledWith(testId);
      expect(window.alert).toHaveBeenCalledWith("Answers load failed: Failed to get doc");
    });
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

  describe("onSave", () => {
    it("should call saveAnswers and alert on success", () => {
      component.onSave();

      expect(answerServiceSpy.saveAnswers).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Answers saved!");
    });
  });

  describe("onClear", () => {
    it("should call clearAnswers", () => {
      component.onClear();

      expect(answerServiceSpy.clearAnswers).toHaveBeenCalled();
    });
  });
});
