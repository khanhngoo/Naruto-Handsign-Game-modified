+ figures-> 1k ->imgs-eval -> content: Image for style transferring ( rename image to content.jpg)
                           -> style: Image for style (rename image to style.jpg) 
+ ouputs -> eval -> picture after being style transferred 

+ run eval.py to transfer image with selected style

python "C:/Vintelligence/RLMiniStyler_full/content/RLMiniStyler/eval.py" --content "C:/Vintelligence/RLMiniStyler_full/content/RLMiniStyler/figures/1K/imgs-eval/content/content.jpg" --style "C:/Vintelligence/RLMiniStyler_full/content/RLMiniStyler/figures/1K/imgs-eval/style/style.jpg" --actor "C:/Vintelligence/RLMiniStyler_full/content/RLMiniStyler/exp/ckpt/actor.pth.tar" --decoder "C:/Vintelligence/RLMiniStyler_full/content/RLMiniStyler/exp/ckpt/builder.pth.tar" --steps 10 --alpha 1.0 --output "C:/Vintelligence/RLMiniStyler_full/content/RLMiniStyler/outputs/eval"

( em không hiểu sao =)) mình phải dán chính xác location của từng thằng 1 thì code mới chạy )


