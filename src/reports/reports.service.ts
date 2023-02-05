import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Report } from './report.entity';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from '../users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);
    report.user = user;
    return this.repo.save(report);
  }

  async changeApproval(id: number, approved: boolean) {
    const report = await this.repo.findOneBy({ id });
    if (!report) {
      throw new NotFoundException('report not found');
    }

    report.approved = approved;
    return this.repo.save(report);
  }

  /*
    - find reports for the same make/model
    - within +/- 5 miles (lng, lat)
    - within 3 years
    - must be an approved report
    - order by closes mileage
    - take the top 3 closest reports and average their value
  */
  async createEstimate({
    make,
    model,
    lng,
    lat,
    year,
    mileage,
  }: GetEstimateDto) {
    return await this.repo
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', {
        make,
      })
      .andWhere('model = :model', {
        model,
      })
      .andWhere('lng - :lng BETWEEN -5 AND 5', {
        lng,
      })
      .andWhere('lat - :lat BETWEEN -5 AND 5', {
        lat,
      })
      .andWhere('year - :year BETWEEN -3 AND 3', {
        year,
      })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }
}
