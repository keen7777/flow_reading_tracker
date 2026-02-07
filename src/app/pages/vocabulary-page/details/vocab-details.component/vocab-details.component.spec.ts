import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabDetailsComponent } from './vocab-details.component';

describe('VocabDetailsComponent', () => {
  let component: VocabDetailsComponent;
  let fixture: ComponentFixture<VocabDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VocabDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
