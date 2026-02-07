import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabSidebarComponent } from './vocab-sidebar.component';

describe('VocabSidebarComponent', () => {
  let component: VocabSidebarComponent;
  let fixture: ComponentFixture<VocabSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VocabSidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
