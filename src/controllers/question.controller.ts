import { ActionResult, Content, Controller, Post, UseHook, HttpContext, Ctx } from 'alosaur';

import { Auth, AuthHookState } from '@/hooks/auth.hook.ts';
import { SuccessCodes } from '@/common/constants.ts';
import { SuccessResponse } from 'types';

@Controller('/question')
export class QuestionController {
  @Post()
  @UseHook(Auth)
  public createPost(@Ctx() ctx: HttpContext<AuthHookState>): ActionResult {
    console.log({ userId: ctx.state!.userId });
    return Content(<SuccessResponse>{
      code: SuccessCodes.SignupSuccessful,
      success: true,
    });
  }
}
