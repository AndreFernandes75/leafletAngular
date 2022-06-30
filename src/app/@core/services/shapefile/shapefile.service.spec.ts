import { TestBed } from '@angular/core/testing';

import { ShapefileService } from './shapefile.service';

describe('ShapefileService', () => {
  let service: ShapefileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShapefileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
