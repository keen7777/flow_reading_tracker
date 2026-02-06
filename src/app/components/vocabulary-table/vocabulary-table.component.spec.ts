import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabularyTable } from './vocabulary-table';

describe('VocabularyTable', () => {
  let component: VocabularyTable;
  let fixture: ComponentFixture<VocabularyTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabularyTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VocabularyTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
