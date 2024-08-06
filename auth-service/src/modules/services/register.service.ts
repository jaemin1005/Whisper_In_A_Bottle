import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import IRegister from 'ts/interfaces/auth/IRegister';
import IPlayerDTO from 'ts/DTOs/IPlayerDTO';
import { ValidationService } from './validation.service';
import User from '../../../ts/entity/User.entity';
import { UserState } from 'src/entity/User-state.entity';
/**
 * * Decorator : Injectable
 * 작성자 : @naviadev / 2024-07-16
 * 편집자 : @naviadev / 2024-07-28
 * Issue : WIB-27
 * @class RegisterServices
 * @description : 데이터베이스에 RegisterInfo Entity Save, 간단한 Type 검사 진행.
 */
@Injectable()
export class RegisterService implements IRegister {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserState)
    private readonly userStateRepository: Repository<UserState>,
    private readonly vaildationService: ValidationService,
  ) {}
  async insertToDatabase(data: IPlayerDTO): Promise<boolean> {
    try {
      if (!this.validateDTO(data)) {
        return false;
      }
      const existingUser = await this.userRepository.findOneBy({
        id: data.id,
      });

      if (existingUser) {
        return false;
      }

      try {
        const userEntity = await this.insertUser(data);
        await this.insertUserState(userEntity.id);
      } catch (error) {
        console.error('Promise_Error : 데이터 삽입 실패', error);
      }
      return true;
    } catch (error) {
      console.error('데이터베이스 실행 오류', error);
    }
  }

  validateDTO(Data: IPlayerDTO): boolean {
    return this.vaildationService.validateDTO(Data);
  }

  private async insertUser(data: IPlayerDTO): Promise<User> {
    const userEntity = this.userRepository.create(data);
    return this.userRepository.save(userEntity);
  }

  private async insertUserState(userId: string): Promise<UserState> {
    const userStateEntity = new UserState();
    userStateEntity.id = userId;
    userStateEntity.receiveTime = 0;
    userStateEntity.lastLoginTime = 0;
    userStateEntity.lastLoginIp = '';
    return this.userStateRepository.save(userStateEntity);
  }
}
