import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonCommandeFormComponent } from './bon-commande-form.component';

describe('BonCommandeFormComponent', () => {
  let component: BonCommandeFormComponent;
  let fixture: ComponentFixture<BonCommandeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonCommandeFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BonCommandeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
